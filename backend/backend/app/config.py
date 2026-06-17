import os
from pydantic import BaseModel, Field

def load_env():
    # Try finding .env file in workspace root, backend root, or current directory
    possible_paths = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")), # Workspace root
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env")),       # Backend root
        os.path.abspath(".env")
    ]
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            parts = line.split("=", 1)
                            key = parts[0].strip()
                            val = parts[1].strip().strip('"').strip("'")
                            os.environ[key] = val
                break
            except Exception:
                pass

# Load env variables
load_env()

class Settings(BaseModel):
    gemini_api_key: str = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))
    cors_origins: list[str] = Field(default_factory=lambda: [x.strip() for x in os.getenv("CORS_ORIGINS", "*").split(",") if x.strip()])
    port: int = Field(default_factory=lambda: int(os.getenv("PORT", "8000")))

settings = Settings()
