from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "")
    better_auth_secret: str = os.getenv("BETTER_AUTH_SECRET", "")
    better_auth_url: str = os.getenv("BETTER_AUTH_URL", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        env_file = ".env"

settings = Settings()