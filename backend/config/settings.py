import os
from typing import Optional

try:
    from pydantic_settings import BaseSettings
except ImportError:
    # Fallback for older pydantic versions
    from pydantic import BaseSettings

class Settings(BaseSettings):
    # Server Configuration
    host: str = "127.0.0.1"
    port: int = 8000
    debug: bool = True
    
    # LLM Configuration
    ollama_host: str = "http://localhost:11434"
    default_model: str = "gemma2:9b"
    fallback_model: str = "llama3.1:8b"
    
    # GitHub API Configuration
    github_token: Optional[str] = None
    github_api_base: str = "https://api.github.com"
    
    # Generation Configuration
    max_bullet_points: int = 5
    min_bullet_points: int = 3
    max_tokens: int = 1000
    temperature: float = 0.7
    
    # File Paths
    template_dir: str = "LateX_template"
    static_dir: str = "static"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Global settings instance
settings = Settings()