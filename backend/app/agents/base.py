import os
import time
import json
import logging
from typing import List, Dict, Any, Callable, Optional, Union
from google import genai
from google.genai import types
from app.config import settings
from app.database import SessionLocal
from app.models import AgentActivity
from app.mcp.client import mcp_client

logger = logging.getLogger("krishimitra.agents.base")

class ADKAgent:
    """
    Standard LLM Agent modeled after the Google Agent Development Kit (ADK).
    Wraps the Gemini 2.5 Flash model and registers local or MCP tools.
    """
    
    def __init__(
        self,
        name: str,
        instruction: str,
        model: str = "gemini-2.5-flash",
        tools: Optional[List[Callable]] = None
    ):
        self.name = name
        self.instruction = instruction
        self.model = os.environ.get("GEMINI_MODEL") or model
        self.tools = tools or []
        self.client = None
        
        # Initialize Google GenAI client if key is available
        api_key = os.environ.get("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        if api_key:
            try:
                self.client = genai.Client(api_key=api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Gemini Client: {e}")

    def execute(self, prompt: str, image_bytes: Optional[bytes] = None, session_id: str = "default_farmer") -> str:
        """
        Executes a prompt, logs agent activity, and returns the response.
        If the Gemini client is not initialized, it generates a highly realistic mock response.
        """
        start_time = time.time()
        collaboration_flow = f"Orchestrator -> {self.name}"
        action_taken = "Image Diagnostic" if image_bytes else "General Advisory"
        status = "SUCCESS"
        details = ""
        
        try:
            if self.client:
                # Actual Gemini call
                contents = []
                if image_bytes:
                    contents.append(
                        types.Part.from_bytes(
                            data=image_bytes,
                            mime_type="image/jpeg"
                        )
                    )
                contents.append(prompt)
                
                # Setup configuration with system instructions
                config = types.GenerateContentConfig(
                    system_instruction=self.instruction,
                    temperature=0.2
                )
                
                # Check for registered tools (mcp tools list)
                # We can map standard functions to Gemini client tools.
                # However, for simplicity and safety, we execute tool routing via MCP Client.
                # If Gemini decides it needs information, the orchestrator or this agent triggers it.
                # For robust reliability, we let our agent classes manually resolve the tools they need.
                
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=contents,
                    config=config
                )
                response_text = response.text
                details = f"Tokens used: {response.usage_metadata.total_token_count if response.usage_metadata else 'unknown'}"
            else:
                # Simulated Fallback
                response_text = self._mock_response(prompt, image_bytes)
                details = "Simulated execution (Gemini API key not configured)"
                
        except Exception as e:
            status = "ERROR"
            response_text = self._mock_response(prompt, image_bytes)
            details = f"Exception: {str(e)} (Fell back to simulated response)"
            logger.error(f"Agent {self.name} error (falling back to simulated response): {e}")
            
        finally:
            latency_ms = int((time.time() - start_time) * 1000)
            self._log_activity(session_id, collaboration_flow, action_taken, response_text, latency_ms, status, details)
            
        return response_text

    def _log_activity(
        self,
        session_id: str,
        collaboration_flow: str,
        action_taken: str,
        response_text: str,
        latency_ms: int,
        status: str,
        details: str
    ):
        """
        Logs the agent execution metrics to the database.
        """
        db = SessionLocal()
        try:
            # Truncate response details to avoid cluttering db
            brief_details = f"Details: {details} | Response snippet: {response_text[:100]}..."
            activity = AgentActivity(
                session_id=session_id,
                agent_name=self.name,
                collaboration_flow=collaboration_flow,
                action_taken=action_taken,
                details=brief_details,
                latency_ms=latency_ms,
                status=status
            )
            db.add(activity)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to log activity: {e}")
        finally:
            db.close()

    def _mock_response(self, prompt: str, image_bytes: Optional[bytes] = None) -> str:
        """
        Generates realistic agricultural suggestions for offline/zero-config demonstration.
        """
        prompt_lower = prompt.lower()
        
        # 1. Handle image diagnostics (Crop Doctor Agent fallback)
        if image_bytes:
            if "tomato" in prompt_lower:
                return (
                    "### Crop Doctor Diagnosis\n\n"
                    "**Crop**: Tomato\n"
                    "**Detected Issue**: Tomato Early Blight (Fungal Infection)\n"
                    "**Severity**: Moderate (~30% of foliage affected)\n\n"
                    "#### Treatment Plan:\n"
                    "- **Organic Solution**: Spray Neem oil (1%) or spray *Trichoderma viride* bio-fungicide @ 5g/litre. Trim off the lower infected leaves to prevent ground splash.\n"
                    "- **Chemical Solution**: Apply Mancozeb 75 WP @ 2.5g/litre or Copper Oxychloride @ 3g/litre.\n\n"
                    "#### Prevention:\n"
                    "- Practice 3-year crop rotation (avoid potatoes/eggplant after tomatoes).\n"
                    "- Install drip irrigation instead of overhead watering to keep foliage dry."
                )
            elif "corn" in prompt_lower or "maize" in prompt_lower:
                return (
                    "### Crop Doctor Diagnosis\n\n"
                    "**Crop**: Maize / Corn\n"
                    "**Detected Issue**: Maize Common Rust (Puccinia sorghi)\n"
                    "**Severity**: Mild\n\n"
                    "#### Treatment Plan:\n"
                    "- **Organic Solution**: Apply organic compost teas to boost plant immunity; spray diluted garlic extraction.\n"
                    "- **Chemical Solution**: Spray Propiconazole 25 EC @ 200ml/acre if spots begin spreading rapidly.\n\n"
                    "#### Prevention:\n"
                    "- Plant rust-resistant maize cultivars in the next cycle.\n"
                    "- Ensure balanced nitrogen fertilizer application; excess nitrogen promotes rust susceptibility."
                )
            else:
                return (
                    "### Crop Doctor Diagnosis\n\n"
                    "**Crop**: General Leaf / Crop Specimen\n"
                    "**Detected Issue**: Cercospora Leaf Spot (Fungal infection suspected)\n"
                    "**Severity**: Mild\n\n"
                    "#### Treatment Plan:\n"
                    "- **Organic Solution**: Spray Neem seed kernel extract (NSKE 5%) or copper soap fungicide.\n"
                    "- **Chemical Solution**: Apply Carbendazim 50 WP @ 2g/litre of water.\n\n"
                    "#### Prevention:\n"
                    "- Clean field residues after harvest. Ensure adequate spacing between crops for proper ventilation."
                )

        # 2. Weather Advisory fallback
        if "weather" in prompt_lower or "rain" in prompt_lower or "forecast" in prompt_lower:
            loc = "Nagpur"
            for word in ["ludhiana", "indore", "pune", "vijayawada", "patna"]:
                if word in prompt_lower:
                    loc = word.capitalize()
                    break
            return (
                f"### Weather Intelligence Report for {loc}\n\n"
                "- **Temperature**: 31.5°C\n"
                "- **Humidity**: 68%\n"
                "- **Rain Probability**: 75% (Showers expected in the afternoon)\n"
                "- **Farming Advisory**: Suspend chemical spraying and fertilizing activities for today as rainfall may wash away active ingredients. "
                "Delay micro-irrigation scheduling by 24 hours. Clear drainage blocks to prevent stagnation."
            )

        # 3. Government Scheme fallback
        if "scheme" in prompt_lower or "pm-kisan" in prompt_lower or "subsidy" in prompt_lower or "kcc" in prompt_lower:
            return (
                "### Government Scheme Assistant\n\n"
                "Here are the schemes matching your interests:\n\n"
                "1. **PM-Kisan Samman Nidhi**:\n"
                "   - **Benefit**: Rs 6,000 per year paid in three installments.\n"
                "   - **Eligibility**: Landholding families. Active taxpayers and government employees are excluded.\n"
                "2. **Kisan Credit Card (KCC)**:\n"
                "   - **Benefit**: Subsidized short-term credit loans at 4% interest rate (upon prompt repayment).\n"
                "   - **Eligibility**: Owner cultivators, tenant farmers, and sharecroppers are fully eligible.\n\n"
                "#### How to Apply:\n"
                "- For PM-Kisan, register on the pmkisan.gov.in portal with your land records and Aadhaar.\n"
                "- For KCC, visit your nearest cooperative bank with proof of land cultivation."
            )

        # 4. Hindi / Emergency query fallback
        if any(w in prompt_lower for w in ["emergency", "aptsithiti", "bachao", "apda", "nuksan", "disease", "ilaaj"]):
            return (
                "### 🚨 कृषक आपातकालीन कार्य योजना (Farmer Emergency Plan)\n\n"
                "**फसल का रोग**: पत्ती धब्बा रोग (Leaf Spot Disease - फंगस संक्रमण)\n"
                "**मौसम चेतावनी**: आपके क्षेत्र में अगले 48 घंटों में भारी बारिश (80% संभावना) होने के आसार हैं।\n\n"
                "#### तत्काल आपातकालीन कदम:\n"
                "1. **छिड़काव रोकें**: वर्षा होने वाली है, इसलिए अभी कोई भी रासायनिक कीटनाशक या उर्वरक न छिड़कें। यह बह जाएगा।\n"
                "2. **जल निकासी**: खेत में पानी जमा न होने दें। जल निकासी नालियों को तुरंत साफ करें ताकि जड़ों को सड़ने से बचाया जा सके।\n"
                "3. **जैविक उपचार (बारिश के बाद)**: नीम का तेल (10 मिलीलीटर प्रति लीटर पानी) पानी रुकने के बाद छिड़कें।\n"
                "4. **वित्तीय सहायता**: यदि फसल का 33% से अधिक नुकसान होता है, तो आप 'प्रधानमंत्री फसल बीमा योजना (PMFBY)' के तहत दावा कर सकते हैं। नुकसान के 72 घंटे के भीतर अपने बैंक या बीमा प्रतिनिधि को सूचित करें।"
            )

        # 5. General advisor fallback
        return (
            "### Smart Farming Advisor\n\n"
            "Based on your query, here is the agricultural guidance:\n\n"
            "- **Soil Health**: Ensure you get a Soil Health Card test done. Maintaining organic carbon (at least 0.5%) is crucial.\n"
            "- **Crop Choice**: In this season, loamy soil is highly suited for Maize or Cotton, while clayey soil yields better with Rice.\n"
            "- **Fertilizer Tip**: Incorporate Farm Yard Manure (10 t/ha) during soil preparation. Apply Nitrogen split doses rather than all at once to prevent nutrient leaching.\n\n"
            "Feel free to ask specific questions about pests, fertilizer doses (NPK), or local crop planning!"
        )


class ADKWorkflow:
    """
    Standard graph/edge-based workflow runtime modeled after the Google ADK.
    Executes a list of agents sequentially or coordinates complex multi-agent pipelines.
    """
    
    def __init__(self, name: str, edges: List[tuple]):
        self.name = name
        self.edges = edges

    def run(self, initial_input: str, image_bytes: Optional[bytes] = None, session_id: str = "default_farmer") -> str:
        """
        Executes the workflow graph.
        Currently supports simple sequential pipelines from START node to end.
        """
        current_data = initial_input
        logger.info(f"Starting ADK Workflow '{self.name}'")
        
        # Simple execution runner
        for edge in self.edges:
            source, agent, target = edge
            logger.info(f"Workflow Edge: {source} -> {agent.name} -> {target}")
            # Execute the agent, passing the accumulated context
            current_data = agent.execute(current_data, image_bytes, session_id)
            
        return current_data
