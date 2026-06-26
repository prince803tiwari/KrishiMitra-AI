import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "KrishiMitra AI"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./krishimitra.db"
    
    # AI API Keys
    GEMINI_API_KEY: str = ""
    
    # Voice Services
    DEEPGRAM_API_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""
    
    # Security Configurations
    MAX_FILE_SIZE_MB: int = 5
    ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp"]
    RATE_LIMIT_LIMIT: int = 60  # requests
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    
    # MCP Configuration
    # These URLs indicate where the MCP servers will be running (over SSE)
    WEATHER_MCP_URL: str = "http://localhost:8000/mcp/weather"
    SCHEME_MCP_URL: str = "http://localhost:8000/mcp/scheme"
    AGRI_MCP_URL: str = "http://localhost:8000/mcp/agri"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
