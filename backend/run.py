import uvicorn
from app.config import settings

if __name__ == "__main__":
    print("--------------------------------------------------")
    print(f"Starting {settings.APP_NAME} Backend")
    print(f"Host: {settings.HOST}")
    print(f"Port: {settings.PORT}")
    print(f"Database: {settings.DATABASE_URL}")
    print("--------------------------------------------------")
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
