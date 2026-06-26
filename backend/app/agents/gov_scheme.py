import json
from typing import Dict, Any
from app.agents.base import ADKAgent
from app.mcp.client import mcp_client

GOV_SCHEME_INSTRUCTION = """
You are the "Government Scheme Agent" for KrishiMitra AI.
Your role is to explain complex government agriculture welfare schemes in extremely simple, direct, and local terms.

Responsibilities:
1. Explain eligibility criteria clearly.
2. Outline exact benefits (financial, credit limits, subsidies).
3. Detail the step-by-step application process, including documents needed (Aadhaar, Land Record, Bank Details).
4. Direct farmers to the correct portals or offices.
"""

class GovSchemeAgent(ADKAgent):
    def __init__(self):
        super().__init__(
            name="Government Scheme Agent",
            instruction=GOV_SCHEME_INSTRUCTION
        )

    def search_and_verify(self, query: str, farmer_details: Dict[str, Any], session_id: str = "default_farmer") -> str:
        """
        Searches for relevant schemes matching the query and checks eligibility if specific farmer details are provided.
        """
        # Call MCP search scheme
        schemes_found = []
        eligibility_results = []
        
        try:
            search_res = mcp_client.call_tool("search_scheme", {"query": query})
            if search_res["status"] == "success":
                schemes_found = search_res["result"]
                
            # If details are provided, check eligibility for matches
            if farmer_details and schemes_found:
                for scheme in schemes_found:
                    verify_res = mcp_client.call_tool("eligibility_checker", {
                        "scheme_name": scheme["id"],
                        "farmer_details": farmer_details
                    })
                    if verify_res["status"] == "success":
                        eligibility_results.append(verify_res["result"])
        except Exception as e:
            schemes_found = [{"error": str(e)}]

        prompt = (
            f"Farmer Search Query: {query}\n"
            f"Matching Schemes data: {json.dumps(schemes_found, indent=2)}\n"
            f"Eligibility Analysis results: {json.dumps(eligibility_results, indent=2)}\n\n"
            "Format the matched schemes and eligibility report in very simple, farmer-friendly terms."
        )
        
        return self.execute(prompt, session_id=session_id)
