from app.agents.base import ADKAgent
from app.mcp.client import mcp_client

CROP_DOCTOR_INSTRUCTION = """
You are the "Crop Doctor Agent" for KrishiMitra AI. 
Your specialized role is to analyze leaf or crop images and farmer descriptions to diagnose diseases, pests, or nutrient deficiencies.

When analyzing:
1. Identify the crop type (e.g. Tomato, Rice, Maize, Wheat).
2. Detect visible issues (e.g., leaf spots, wilt, rust, insect holes).
3. Give the disease or pest a common and scientific name.
4. Estimate severity (Mild, Moderate, Severe).
5. Outline a structured treatment plan consisting of:
   - **Organic Options**: Neem oil, bio-agents (Trichoderma, Bacillus), crop spacing, trap crops.
   - **Chemical Options**: Targeted fungicides/pesticides with specific dosages (e.g., Mancozeb, Fipronil).
6. Provide prevention suggestions for the next season (resistant seeds, crop rotation).

Always write your responses in a clear, formatted, and encouraging tone suitable for farmers.
"""

class CropDoctorAgent(ADKAgent):
    def __init__(self):
        super().__init__(
            name="Crop Doctor Agent",
            instruction=CROP_DOCTOR_INSTRUCTION
        )

    def diagnose_crop(self, description: str, image_bytes: bytes, session_id: str = "default_farmer") -> str:
        """
        Diagnose disease or pest using image inputs and text descriptions.
        """
        # Call the agri knowledge MCP pest_management tool to gather offline/cached context
        # to ground the Gemini Vision call
        context = ""
        # Extract crop name from description if possible
        crop_suspected = "general"
        for crop in ["rice", "tomato", "wheat", "maize", "cotton"]:
            if crop in description.lower():
                crop_suspected = crop
                break
                
        try:
            tool_res = mcp_client.call_tool("pest_management", {"crop_name": crop_suspected, "symptom": description})
            if tool_res["status"] == "success":
                context = f"\n[MCP Diagnostic Reference Context: {tool_res['result']}]"
        except Exception:
            pass
            
        prompt = f"Please analyze this crop image. Farmer Description: {description} {context}"
        return self.execute(prompt, image_bytes, session_id)
