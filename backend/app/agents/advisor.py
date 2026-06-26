import json
from app.agents.base import ADKAgent
from app.mcp.client import mcp_client

ADVISOR_INSTRUCTION = """
You are the "Smart Farming Advisor Agent" for KrishiMitra AI.
Your role is to offer expert agronomic advice on seed selection, soil preparation, crop cycles, fertilizer regimes, and sustainable farming practices.

Key directions:
- Recommend ideal N-P-K fertilizer proportions and schedule of application based on crop type.
- Advise on organic alternatives (composting, green manure, bio-pesticides) alongside chemical options.
- Give regional soil planning guidance.
- Keep recommendations simple and cost-efficient for smallholder farmers.
"""

class SmartFarmingAdvisorAgent(ADKAgent):
    def __init__(self):
        super().__init__(
            name="Smart Farming Advisor Agent",
            instruction=ADVISOR_INSTRUCTION
        )

    def advise(self, query: str, soil_type: str = "loamy", season: str = "kharif", region: str = "maharashtra", session_id: str = "default_farmer") -> str:
        """
        Uses Agri Knowledge MCP tools to construct a detailed advisory response.
        """
        crop_recs = {}
        fert_recs = {}
        
        try:
            # 1. Look up crop recommendations
            crop_res = mcp_client.call_tool("crop_recommendation", {
                "soil_type": soil_type,
                "season": season,
                "region": region
            })
            if crop_res["status"] == "success":
                crop_recs = crop_res["result"]
                
            # 2. Extract potential crop name to run fertilizer check
            suspected_crop = "rice" if "rice" in query.lower() else "wheat" if "wheat" in query.lower() else "cotton" if "cotton" in query.lower() else None
            if not suspected_crop and crop_recs.get("recommended_crops"):
                suspected_crop = crop_recs["recommended_crops"][0].lower()
                
            if suspected_crop:
                fert_res = mcp_client.call_tool("fertilizer_recommendation", {
                    "crop_name": suspected_crop,
                    "soil_type": soil_type
                })
                if fert_res["status"] == "success":
                    fert_recs = fert_res["result"]
        except Exception as e:
            crop_recs = {"error": str(e)}

        prompt = (
            f"Farmer Inquiry: {query}\n"
            f"Current Context:\n"
            f"- Soil Type: {soil_type}, Season: {season}, Region: {region}\n"
            f"- MCP Recommended Crops: {json.dumps(crop_recs, indent=2)}\n"
            f"- MCP Fertilizer Advice: {json.dumps(fert_recs, indent=2)}\n\n"
            "Formulate a complete response addressing the farmer's inquiry and expanding on agronomic best practices."
        )
        
        return self.execute(prompt, session_id=session_id)
