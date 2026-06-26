import logging
from typing import Dict, Any, List
from app.mcp import weather_server, scheme_server, agriknowledge_server

logger = logging.getLogger("krishimitra.mcp_client")

class MCPClient:
    """
    A unified Model Context Protocol (MCP) client.
    Discovers available tools and routes tool calls to the correct MCP servers.
    Supports local execution fallback when standalone server processes are not running.
    """
    
    def __init__(self):
        self.servers = {
            "weather": {
                "name": "Weather MCP Server",
                "tools": {
                    "get_weather": weather_server.get_weather,
                    "get_forecast": weather_server.get_forecast,
                    "get_rain_probability": weather_server.get_rain_probability
                }
            },
            "scheme": {
                "name": "Government Scheme MCP Server",
                "tools": {
                    "search_scheme": scheme_server.search_scheme,
                    "eligibility_checker": scheme_server.eligibility_checker
                }
            },
            "agri": {
                "name": "Agriculture Knowledge MCP Server",
                "tools": {
                    "crop_recommendation": agriknowledge_server.crop_recommendation,
                    "fertilizer_recommendation": agriknowledge_server.fertilizer_recommendation,
                    "pest_management": agriknowledge_server.pest_management
                }
            }
        }

    def list_tools(self) -> List[Dict[str, Any]]:
        """
        Lists all available tools across all MCP servers with their schemas.
        """
        tool_schemas = []
        
        # Weather tools
        tool_schemas.append({
            "name": "get_weather",
            "server": "weather",
            "description": "Get current weather conditions (temp, humidity, soil moisture) for a specific city or district.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "The city or district name in India."}
                },
                "required": ["location"]
            }
        })
        tool_schemas.append({
            "name": "get_forecast",
            "server": "weather",
            "description": "Get a 3-day weather forecast and irrigation recommendations for a city or district.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "The city or district name in India."}
                },
                "required": ["location"]
            }
        })
        tool_schemas.append({
            "name": "get_rain_probability",
            "server": "weather",
            "description": "Get the percentage probability of rainfall and irrigation water management advice.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "The city or district name in India."}
                },
                "required": ["location"]
            }
        })
        
        # Scheme tools
        tool_schemas.append({
            "name": "search_scheme",
            "server": "scheme",
            "description": "Search government agricultural schemes (e.g. PM-Kisan, KCC, PMFBY) by keywords.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Keywords to search like 'subsidy', 'insurance', 'loan'."}
                },
                "required": ["query"]
            }
        })
        tool_schemas.append({
            "name": "eligibility_checker",
            "server": "scheme",
            "description": "Evaluate if a farmer is eligible for a specific scheme based on land size, land ownership, taxpayer status, etc.",
            "parameters": {
                "type": "object",
                "properties": {
                    "scheme_name": {"type": "string", "description": "Exact name or ID of the scheme."},
                    "farmer_details": {
                        "type": "object",
                        "properties": {
                            "land_size_ha": {"type": "number", "description": "Land size in hectares."},
                            "owns_land": {"type": "boolean", "description": "True if farmer owns the land."},
                            "is_taxpayer": {"type": "boolean", "description": "True if farmer pays income tax."},
                            "job_type": {"type": "string", "description": "Job description, e.g. 'farmer', 'government'."},
                            "group_farming": {"type": "boolean", "description": "True if part of a farming cooperative/cluster."}
                        },
                        "required": ["land_size_ha", "owns_land"]
                    }
                },
                "required": ["scheme_name", "farmer_details"]
            }
        })
        
        # Agri tools
        tool_schemas.append({
            "name": "crop_recommendation",
            "server": "agri",
            "description": "Recommend crops based on soil type, planting season, and Indian region.",
            "parameters": {
                "type": "object",
                "properties": {
                    "soil_type": {"type": "string", "description": "Soil type ('clayey', 'loamy', 'sandy', 'black')."},
                    "season": {"type": "string", "description": "Season ('kharif', 'rabi', 'zaid')."},
                    "region": {"type": "string", "description": "Indian state or region (e.g., 'punjab', 'maharashtra')."}
                },
                "required": ["soil_type", "season", "region"]
            }
        })
        tool_schemas.append({
            "name": "fertilizer_recommendation",
            "server": "agri",
            "description": "Provide Nitrogen-Phosphorus-Potassium (NPK) ratios and organic/chemical instructions for a crop.",
            "parameters": {
                "type": "object",
                "properties": {
                    "crop_name": {"type": "string", "description": "Crop name (e.g., 'rice', 'wheat', 'cotton')."},
                    "soil_type": {"type": "string", "description": "Soil type ('clayey', 'loamy', 'sandy', 'black')."}
                },
                "required": ["crop_name", "soil_type"]
            }
        })
        tool_schemas.append({
            "name": "pest_management",
            "server": "agri",
            "description": "Recommend organic and chemical remedies for a crop based on pest/disease symptoms.",
            "parameters": {
                "type": "object",
                "properties": {
                    "crop_name": {"type": "string", "description": "Crop name."},
                    "symptom": {"type": "string", "description": "Observed symptoms on leaves or crop (e.g. 'yellow rust', 'holes in fruit')."}
                },
                "required": ["crop_name", "symptom"]
            }
        })
        
        return tool_schemas

    def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Routes the tool execution request to the appropriate MCP server implementation.
        """
        logger.info(f"MCP Client: Calling tool '{tool_name}' with args {arguments}")
        
        # Look up tool handler
        handler = None
        server_name = None
        for s_key, s_val in self.servers.items():
            if tool_name in s_val["tools"]:
                handler = s_val["tools"][tool_name]
                server_name = s_val["name"]
                break
                
        if not handler:
            raise ValueError(f"Tool '{tool_name}' not found on any registered MCP server.")
            
        try:
            # Execute and return
            result = handler(**arguments)
            return {
                "status": "success",
                "server": server_name,
                "tool": tool_name,
                "result": result
            }
        except Exception as e:
            logger.error(f"Error calling MCP tool '{tool_name}': {str(e)}")
            return {
                "status": "error",
                "server": server_name,
                "tool": tool_name,
                "message": str(e)
            }

mcp_client = MCPClient()
