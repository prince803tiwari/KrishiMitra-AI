import sys
from app.mcp.weather_server import get_forecast, get_weather

if __name__ == "__main__":
    loc = "Nagpur"
    if len(sys.argv) > 1:
        loc = sys.argv[1]
    print("Testing geocoding and forecast for:", loc)
    try:
        res = get_forecast(loc)
        print("Forecast result:")
        print(res)
    except Exception as e:
        print("Error during get_forecast:", e)
        
    try:
        res_w = get_weather(loc)
        print("Weather result:")
        print(res_w)
    except Exception as e:
        print("Error during get_weather:", e)
