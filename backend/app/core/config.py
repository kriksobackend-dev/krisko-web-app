from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "KRIKSO API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"

    database_url: str

    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str

    razorpay_key_id: str
    razorpay_key_secret: str
    razorpay_webhook_secret: str

    shiprocket_email: str
    shiprocket_password: str
    shiprocket_base_url: str = "https://apiv2.shiprocket.in/v1/external"

    cors_origins: str = Field(default="http://localhost:5173,http://localhost:5174")
    access_token_expire_minutes: int = 60

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def async_database_url(self) -> str:
        if self.database_url.startswith("postgres://"):
            return self.database_url.replace("postgres://", "postgresql+asyncpg://", 1)
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()

