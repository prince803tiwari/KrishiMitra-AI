import os
import logging
from fastapi import FastAPI, Depends, UploadFile, File, Form, Query, HTTPException, Request

logger = logging.getLogger("krishimitra.main")
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import json
import datetime

from app.config import settings
from app.database import engine, Base, get_db
from app.models import CropScan, WeatherLog, SchemeLog, ChatMessage, AgentActivity
from app.security import validate_uploaded_file, sanitize_input, check_prompt_injection, rate_limiter
from app.agents.orchestrator import orchestrator
from app.voice_utils import transcribe_audio

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Full-Stack AI Multi-Agent system for supporting farmers.",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiter Middleware
@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "127.0.0.1"
    if rate_limiter.is_rate_limited(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please slow down.")
    return await call_next(request)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "gemini_api_configured": bool(os.environ.get("GEMINI_API_KEY") or settings.GEMINI_API_KEY)
    }

# 1. Crop Doctor Endpoint
@app.post("/api/diagnose")
async def diagnose_crop(
    description: str = Form(...),
    image: UploadFile = File(...),
    session_id: str = Form("default_farmer"),
    db: Session = Depends(get_db)
):
    # Sanitize and validate inputs
    clean_desc = sanitize_input(description)
    if check_prompt_injection(clean_desc):
        raise HTTPException(status_code=400, detail="Security Warning: Prompt injection detected.")
        
    image_bytes = await image.read()
    validate_uploaded_file(image_bytes, image.filename)
    
    # Run Agent
    response_text = orchestrator.crop_doctor.diagnose_crop(
        description=clean_desc,
        image_bytes=image_bytes,
        session_id=session_id
    )
    
    # Parse crop and disease details from output if possible (or fallback)
    crop_type = "Tomato" if "tomato" in clean_desc.lower() else "Maize" if "corn" in clean_desc.lower() or "maize" in clean_desc.lower() else "General"
    disease_name = "Early Blight" if "blight" in response_text.lower() else "Common Rust" if "rust" in response_text.lower() else "Cercospora Spot"
    severity = "Moderate" if "moderate" in response_text.lower() else "Severe" if "severe" in response_text.lower() else "Mild"
    
    # Save to Database
    db_scan = CropScan(
        session_id=session_id,
        image_name=image.filename,
        crop_type=crop_type,
        disease_name=disease_name,
        severity=severity,
        treatment=response_text,
        prevention="Crop rotation, moisture monitoring, clean sanitation."
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    
    return {
        "scan_id": db_scan.id,
        "crop_type": crop_type,
        "disease_name": disease_name,
        "severity": severity,
        "diagnosis": response_text
    }

# 2. Weather Advisory Endpoint
@app.get("/api/weather")
def get_weather_advisory(
    location: str = Query(..., min_length=2),
    session_id: str = Query("default_farmer"),
    db: Session = Depends(get_db)
):
    clean_loc = sanitize_input(location)
    if check_prompt_injection(clean_loc):
         raise HTTPException(status_code=400, detail="Security Warning: Prompt injection detected.")
         
    advisory = orchestrator.weather.get_agricultural_weather_advisory(
        location=clean_loc,
        session_id=session_id
    )
    
    # Fetch real weather details to save in DB log
    temp = 32.5
    rain_prob = 75.0
    conds = "Unsettled"
    try:
        from app.mcp.client import mcp_client
        weather_res = mcp_client.call_tool("get_weather", {"location": clean_loc})
        if weather_res["status"] == "success":
            w_data = weather_res["result"]
            temp = w_data.get("temperature_c", 32.5)
            rain_prob = w_data.get("rain_probability", 75.0)
            conds = w_data.get("conditions", "Unsettled")
    except Exception as e:
        logger.error(f"Failed to fetch live weather details for log: {e}")
        
    db_log = WeatherLog(
        session_id=session_id,
        location=clean_loc,
        temperature=temp,
        rain_probability=rain_prob,
        conditions=conds,
        recommendations=advisory
    )
    db.add(db_log)
    db.commit()
    
    return {
        "location": clean_loc,
        "advisory": advisory
    }

# 3. Government Scheme Search & Checker
@app.get("/api/schemes")
def search_and_check_scheme(
    query: str = Query(...),
    land_size_ha: float = Query(1.5),
    owns_land: bool = Query(True),
    is_taxpayer: bool = Query(False),
    job_type: str = Query("farmer"),
    group_farming: bool = Query(False),
    session_id: str = Query("default_farmer"),
    db: Session = Depends(get_db)
):
    clean_query = sanitize_input(query)
    if check_prompt_injection(clean_query):
         raise HTTPException(status_code=400, detail="Security Warning: Prompt injection detected.")
         
    farmer_details = {
        "land_size_ha": land_size_ha,
        "owns_land": owns_land,
        "is_taxpayer": is_taxpayer,
        "job_type": job_type,
        "group_farming": group_farming
    }
    
    advisory = orchestrator.gov_scheme.search_and_verify(
        query=clean_query,
        farmer_details=farmer_details,
        session_id=session_id
    )
    
    # Log to DB
    db_log = SchemeLog(
        session_id=session_id,
        scheme_name=clean_query,
        eligible=True if "eligible: true" in advisory.lower() or "congratulations" in advisory.lower() else False,
        notes=advisory
    )
    db.add(db_log)
    db.commit()
    
    return {
        "query": clean_query,
        "advisory": advisory
    }

# 4. Smart Farming Advisor Chat
@app.post("/api/advisor/chat")
async def advisor_chat(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    query = sanitize_input(body.get("message", ""))
    soil_type = sanitize_input(body.get("soil_type", "loamy"))
    season = sanitize_input(body.get("season", "kharif"))
    region = sanitize_input(body.get("region", "maharashtra"))
    session_id = sanitize_input(body.get("session_id", "default_farmer"))
    
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    if check_prompt_injection(query):
         raise HTTPException(status_code=400, detail="Security Warning: Prompt injection detected.")
         
    # Save User message
    user_msg = ChatMessage(session_id=session_id, sender="user", message=query)
    db.add(user_msg)
    
    # Run Agent
    response = orchestrator.advisor.advise(
        query=query,
        soil_type=soil_type,
        season=season,
        region=region,
        session_id=session_id
    )
    
    # Save Advisor message
    advisor_msg = ChatMessage(session_id=session_id, sender="advisor", message=response)
    db.add(advisor_msg)
    db.commit()
    
    return {
        "reply": response
    }

# 5. Voice Assistant Endpoint
@app.post("/api/voice")
async def process_voice_assistant(
    audio: UploadFile = File(None),
    transcript_text: str = Form(None),
    language: str = Form("english"),
    session_id: str = Form("default_farmer"),
    db: Session = Depends(get_db)
):
    if audio:
        audio_bytes = await audio.read()
        # Map frontend language selection to Deepgram language codes
        lang_code = "hi" if language.lower() == "hindi" else "en"
        # Transcribe using Deepgram passing the actual content type and mapped language code
        transcript = await transcribe_audio(
            audio_bytes,
            content_type=audio.content_type or "audio/wav",
            language=lang_code
        )
    else:
        transcript = transcript_text or ""
        
    if not transcript:
        raise HTTPException(status_code=400, detail="No audio file or text transcript was provided.")
        
    # Clean transcripts
    clean_transcript = sanitize_input(transcript)
    
    # Save User message
    db.add(ChatMessage(session_id=session_id, sender="user", message=f"[Voice Input] {clean_transcript}"))
    
    # Run Voice Agent (Short, voice-optimized sentences)
    voice_response = orchestrator.voice.process_voice_query(
        transcript=clean_transcript,
        language=language,
        session_id=session_id
    )
    
    # Save Voice response
    db.add(ChatMessage(session_id=session_id, sender="voice", message=voice_response))
    db.commit()
    
    return {
        "transcript": clean_transcript,
        "voice_response": voice_response
    }

# 6. Farmer Emergency Mode (BONUS FEATURE)
@app.post("/api/emergency")
async def trigger_emergency_mode(
    description: str = Form(...),
    image: UploadFile = File(...),
    location: str = Form("Nagpur"),
    session_id: str = Form("default_farmer"),
    db: Session = Depends(get_db)
):
    clean_desc = sanitize_input(description)
    clean_loc = sanitize_input(location)
    
    if check_prompt_injection(clean_desc):
         raise HTTPException(status_code=400, detail="Security Warning: Prompt injection detected.")
         
    image_bytes = await image.read()
    validate_uploaded_file(image_bytes, image.filename)
    
    # Run orchestrator workflow
    emergency_plan = orchestrator.handle_emergency_mode(
        image_bytes=image_bytes,
        hindi_description=clean_desc,
        location=clean_loc,
        session_id=session_id
    )
    
    # Log emergency scan to crop doctor history
    db_scan = CropScan(
        session_id=session_id,
        image_name=image.filename,
        crop_type="Tomato" if "tamatar" in clean_desc.lower() or "tomato" in clean_desc.lower() else "General",
        disease_name="Leaf Spot (Emergency)",
        severity="Severe",
        treatment=emergency_plan["final_action_plan_hindi"],
        prevention="Immediate drainage management, crop isolation, weather monitoring."
    )
    db.add(db_scan)
    db.commit()
    
    return emergency_plan

# 7. Agent Activity Log Monitor
@app.get("/api/logs/activity")
def get_activity_logs(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    logs = db.query(AgentActivity).order_by(AgentActivity.timestamp.desc()).limit(limit).all()
    return logs

# 8. User History Summary
@app.get("/api/history")
def get_user_history(
    session_id: str = "default_farmer",
    db: Session = Depends(get_db)
):
    scans = db.query(CropScan).filter(CropScan.session_id == session_id).order_by(CropScan.created_at.desc()).all()
    weather = db.query(WeatherLog).filter(WeatherLog.session_id == session_id).order_by(WeatherLog.created_at.desc()).all()
    schemes = db.query(SchemeLog).filter(SchemeLog.session_id == session_id).order_by(SchemeLog.created_at.desc()).all()
    chats = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
    
    return {
        "crop_scans": scans,
        "weather_logs": weather,
        "scheme_logs": schemes,
        "chat_history": chats
    }

# 9. Seed Mock Data
@app.post("/api/seed")
def seed_mock_data(db: Session = Depends(get_db)):
    # Clear existing if any to avoid duplicates
    db.query(AgentActivity).delete()
    db.query(CropScan).delete()
    db.query(WeatherLog).delete()
    db.query(SchemeLog).delete()
    db.query(ChatMessage).delete()
    
    # 1. Seed crop doctor scan
    scan1 = CropScan(
        image_name="cotton_leaf_blight.jpg",
        crop_type="Cotton",
        disease_name="Bacterial Leaf Blight",
        severity="Moderate",
        treatment="Spray Copper Oxychloride 50 WP (2.5 g/L) + Streptocycline (1 g/10 L) during morning hours.",
        prevention="Sow certified disease-resistant seeds. Rotate crops with cereal plants next monsoon."
    )
    db.add(scan1)
    
    # 2. Seed weather log
    weather1 = WeatherLog(
        location="Pune",
        temperature=28.5,
        rain_probability=80.0,
        conditions="Heavy Rain Warnings",
        recommendations="Heavy downpour expected in the next 12 hours. Suspend urea top-dressing. Open fields drainage channels to prevent waterlogging."
    )
    db.add(weather1)
    
    # 3. Seed scheme log
    scheme1 = SchemeLog(
        scheme_name="PM-Kisan Samman Nidhi",
        eligible=True,
        notes="Eligible. Small landholding detected (1.2 ha). No tax exclusions apply. Proceed to apply on pmkisan.gov.in."
    )
    db.add(scheme1)
    
    # 4. Seed chat history
    chats = [
        ChatMessage(sender="user", message="Can I plant soybean in black clayey soil in Kharif season?"),
        ChatMessage(sender="advisor", message="Yes! Soybean grows excellently in black clayey soils (Regur soil) during the Kharif season (monsoon). It provides excellent drainage holding capacity and holds critical nitrogen-fixing nodules. Use a seed rate of 30 kg/acre and apply NPK in 12:32:16 ratio."),
        ChatMessage(sender="user", message="What organic fertilizer can I add?"),
        ChatMessage(sender="advisor", message="You can apply 4 to 5 tonnes of Farm Yard Manure (composted cow dung) per acre during land preparation. Also consider treating the seeds with Rhizobium culture to enhance nitrogen fixation.")
    ]
    db.add_all(chats)
    
    # 5. Seed Agent Activities (Activity Monitor)
    activities = [
        AgentActivity(
            agent_name="Main Orchestrator Agent",
            collaboration_flow="START -> Orchestrator -> Router Decision",
            action_taken="Routing query",
            details="Routed: 'Soybean seed rate' -> Smart Farming Advisor",
            latency_ms=120,
            status="SUCCESS",
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=10)
        ),
        AgentActivity(
            agent_name="Smart Farming Advisor Agent",
            collaboration_flow="Orchestrator -> Smart Farming Advisor Agent",
            action_taken="Consulting Crop Recommendations",
            details="Called MCP Tool 'crop_recommendation' for soil=black, season=kharif, region=maharashtra. Output: ['Soybean', 'Cotton', 'Pigeon Pea']",
            latency_ms=450,
            status="SUCCESS",
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=9)
        ),
        AgentActivity(
            agent_name="Main Orchestrator Agent",
            collaboration_flow="START -> Orchestrator -> CropDoctor",
            action_taken="Routing Image Scan",
            details="Routed cotton_leaf_blight.jpg image for analysis.",
            latency_ms=180,
            status="SUCCESS",
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=5)
        ),
        AgentActivity(
            agent_name="Crop Doctor Agent",
            collaboration_flow="Orchestrator -> Crop Doctor Agent",
            action_taken="Running Vision Analysis",
            details="Called Gemini Vision. Diagnosed: Bacterial Leaf Blight. Recommended copper treatment.",
            latency_ms=1250,
            status="SUCCESS",
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=4)
        )
    ]
    db.add_all(activities)
    
    db.commit()
    return {"message": "Database seeded with default mock logs and activities."}
