import time
import logging
from typing import Dict, Any, Optional
from app.agents.base import ADKAgent, ADKWorkflow
from app.agents.crop_doctor import CropDoctorAgent
from app.agents.weather import WeatherAgent
from app.agents.gov_scheme import GovSchemeAgent
from app.agents.advisor import SmartFarmingAdvisorAgent
from app.agents.voice import VoiceAssistantAgent

logger = logging.getLogger("krishimitra.orchestrator")

class OrchestratorAgent(ADKAgent):
    """
    Main Orchestrator Agent. Analyzes queries, routes requests to sub-agents,
    and runs multi-agent workflows such as the Farmer Emergency Mode.
    """
    
    def __init__(self):
        super().__init__(
            name="Main Orchestrator Agent",
            instruction="""
            You are the Main Orchestrator for KrishiMitra AI. 
            Your role is to analyze the farmer's query, determine their core intent, 
            and recommend which sub-agent is best suited to handle it:
            1. Crop Doctor Agent (for disease, leaf, insect, pest diagnostics)
            2. Weather Intelligence Agent (for weather forecasts, rainfall, irrigation scheduling)
            3. Government Scheme Agent (for PM-Kisan, KCC, insurance, crop subsidies)
            4. Smart Farming Advisor Agent (for soil health, seed recommendations, general cultivation)
            5. Voice Assistant Agent (for short, voice-optimized translations)
            
            Return the routing decision in JSON format:
            {"agent": "crop_doctor" | "weather" | "gov_scheme" | "advisor" | "voice", "confidence": 0.0-1.0}
            """
        )
        # Instantiate sub-agents
        self.crop_doctor = CropDoctorAgent()
        self.weather = WeatherAgent()
        self.gov_scheme = GovSchemeAgent()
        self.advisor = SmartFarmingAdvisorAgent()
        self.voice = VoiceAssistantAgent()

    def route_request(self, query: str) -> str:
        """
        Analyzes the query and returns the name of the designated agent.
        """
        query_lower = query.lower()
        if "weather" in query_lower or "rain" in query_lower or "monsoon" in query_lower or "forecast" in query_lower:
            return "weather"
        elif "scheme" in query_lower or "pm-kisan" in query_lower or "subsidy" in query_lower or "loan" in query_lower or "kcc" in query_lower or "bima" in query_lower:
            return "gov_scheme"
        elif "leaf" in query_lower or "disease" in query_lower or "pest" in query_lower or "spots" in query_lower or "insect" in query_lower or "wilt" in query_lower:
            return "crop_doctor"
        elif "voice" in query_lower or "speak" in query_lower or "boliye" in query_lower:
            return "voice"
        else:
            return "advisor"

    def handle_emergency_mode(
        self,
        image_bytes: bytes,
        hindi_description: str,
        location: str = "Nagpur",
        session_id: str = "default_farmer"
    ) -> Dict[str, Any]:
        """
        Runs the Farmer Emergency Mode multi-agent workflow:
        1. Crop Doctor analyzes the image and identifies the leaf disease.
        2. Weather Agent fetches current conditions/forecast to assess rain and storm warnings.
        3. Farming Advisor synthesizes N-P-K and pest-management remedies.
        4. Main Orchestrator aggregates these insights and constructs an actionable response in simple Hindi.
        """
        start_time = time.time()
        logs = []
        
        # Log flow start
        logs.append(f"[{time.strftime('%X')}] 🚨 Emergency Mode activated by farmer.")
        
        # 1. Invoke Crop Doctor Agent
        logs.append(f"[{time.strftime('%X')}] Invoking Crop Doctor Agent for visual leaf analysis...")
        doctor_res = self.crop_doctor.diagnose_crop(
            description=f"Emergency Leaf Diagnosis: {hindi_description}",
            image_bytes=image_bytes,
            session_id=session_id
        )
        logs.append(f"[{time.strftime('%X')}] Crop Doctor Agent completed analysis.")
        
        # 2. Invoke Weather Intelligence Agent
        logs.append(f"[{time.strftime('%X')}] Invoking Weather Intelligence Agent for local forecast in {location}...")
        weather_res = self.weather.get_agricultural_weather_advisory(
            location=location,
            session_id=session_id
        )
        logs.append(f"[{time.strftime('%X')}] Weather Intelligence Agent completed report.")

        # 3. Invoke Smart Farming Advisor Agent
        logs.append(f"[{time.strftime('%X')}] Invoking Smart Farming Advisor Agent for treatment formulation...")
        advisor_res = self.advisor.advise(
            query=f"Formulate emergency pest remedy for diagnosed crop: {doctor_res}",
            session_id=session_id
        )
        logs.append(f"[{time.strftime('%X')}] Smart Farming Advisor Agent completed treatment plan.")
        
        # 4. Synthesize all reports into simple Hindi with Orchestrator instruction
        logs.append(f"[{time.strftime('%X')}] Main Orchestrator aggregating analyses and translating to Hindi...")
        
        synthesis_prompt = (
            f"FARMER DESCRIPTION: {hindi_description}\n\n"
            f"DIAGNOSTIC REPORT:\n{doctor_res}\n\n"
            f"WEATHER REPORT:\n{weather_res}\n\n"
            f"ADVISORY REMEDIES:\n{advisor_res}\n\n"
            "Compile all the above information into a single emergency action plan in simple Hindi (Devanagari). "
            "Address: 1. रोग का नाम और गंभीरता (Disease Name & Severity) 2. मौसम का प्रभाव और सिंचाई सलाह (Weather Impact & Irrigation Advice) "
            "3. रासायनिक और जैविक उपचार (Chemical & Organic Treatment) 4. अगला कदम (Next Step). "
            "Make it highly supportive and easy to read. Provide a very short summary (max 3 sentences) at the end optimized for a voice response."
        )
        
        # Run orchestrator synthesis
        final_hindi_plan = self.execute(
            prompt=synthesis_prompt,
            session_id=session_id
        )
        
        # Extract voice script from synthesis
        voice_prompt = (
            f"Create a short voice assistant script (no markdown, simple Hindi speech) "
            f"summarizing this plan:\n{final_hindi_plan}"
        )
        voice_script = self.voice.process_voice_query(
            transcript=voice_prompt,
            language="hindi",
            session_id=session_id
        )
        
        latency_ms = int((time.time() - start_time) * 1000)
        logs.append(f"[{time.strftime('%X')}] Multi-agent emergency workflow successfully completed in {latency_ms}ms.")
        
        # Log Orchestrator activity for the whole workflow
        self._log_activity(
            session_id=session_id,
            collaboration_flow="Orchestrator -> CropDoctor + Weather + Advisor -> Orchestrator -> Voice",
            action_taken="Farmer Emergency Workflow",
            response_text=final_hindi_plan,
            latency_ms=latency_ms,
            status="SUCCESS",
            details="Emergency Mode compilation"
        )
        
        return {
            "disease_report": doctor_res,
            "weather_report": weather_res,
            "treatment_plan": advisor_res,
            "final_action_plan_hindi": final_hindi_plan,
            "voice_script": voice_script,
            "workflow_logs": logs,
            "latency_ms": latency_ms
        }

orchestrator = OrchestratorAgent()
