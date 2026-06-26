import json
from app.agents.base import ADKAgent
from app.mcp.client import mcp_client

WEATHER_AGENT_INSTRUCTION = """
You are the "Weather Intelligence Agent" for KrishiMitra AI.
Your specialized role is to interpret weather data (temperature, humidity, rain probability, wind speed, soil moisture) and provide actionable crop management decisions.

Guidelines:
- Explain if rainfall is imminent and if irrigation should be suspended to conserve water and prevent soil erosion.
- Advise on chemical/pesticide spraying (high winds or rain will ruin spraying).
- Recommend harvesting timings (avoid harvesting during or right before rains).
- Suggest crop protection measures (e.g. frost protection, shade nets for extreme heat).
"""

class WeatherAgent(ADKAgent):
    def __init__(self):
        super().__init__(
            name="Weather Intelligence Agent",
            instruction=WEATHER_AGENT_INSTRUCTION
        )

    def get_agricultural_weather_advisory(self, location: str, session_id: str = "default_farmer") -> str:
        """
        Retrieves weather insights using the Weather MCP Server tools and generates
        a comprehensive farming weather advisory.
        """
        # Call the MCP weather forecast tool
        weather_data = {}
        rain_data = {}
        try:
            forecast_res = mcp_client.call_tool("get_forecast", {"location": location})
            if forecast_res["status"] == "success":
                weather_data = forecast_res["result"]
                
            rain_res = mcp_client.call_tool("get_rain_probability", {"location": location})
            if rain_res["status"] == "success":
                rain_data = rain_res["result"]
        except Exception as e:
            weather_data = {"error": str(e)}
            
        prompt = (
            f"Here is the weather data retrieved from the Weather MCP Server for {location}:\n"
            f"{json.dumps(weather_data, indent=2)}\n"
            f"Rain advice context: {json.dumps(rain_data, indent=2)}\n\n"
            "Generate a highly practical, structured agricultural weather advisory for the farmer."
        )
        
        return self.execute(prompt, session_id=session_id)
