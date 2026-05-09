from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    app_name: str = "Pathfinder AI API"
    frontend_origin: str = "http://localhost:5173"
    openai_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("OPENAI_API_KEY", "PATHFINDER_OPENAI_API_KEY"),
    )
    openai_model: str = Field(
        default="gpt-5.4-mini",
        validation_alias=AliasChoices("OPENAI_MODEL", "PATHFINDER_OPENAI_MODEL"),
    )

    model_config = SettingsConfigDict(
        env_file=(str(BACKEND_DIR / ".env"), ".env"),
        env_prefix="PATHFINDER_",
        extra="ignore",
    )


settings = Settings()
