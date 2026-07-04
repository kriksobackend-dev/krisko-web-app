import uuid

from fastapi import HTTPException, status
from supabase import Client, create_client
from supabase_auth.errors import AuthApiError

from app.core.config import get_settings


class SupabaseAuthService:
    def __init__(self) -> None:
        settings = get_settings()
        self.client: Client = create_client(settings.supabase_url, settings.supabase_anon_key)
        self.admin_client: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)

    async def signup(self, email: str, password: str, metadata: dict[str, str]) -> dict:
        try:
            response = self.client.auth.sign_up({"email": email, "password": password, "options": {"data": metadata}})
        except AuthApiError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
        if not response.user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Signup failed")
        return {
            "user_id": uuid.UUID(response.user.id),
            "access_token": response.session.access_token if response.session else None,
            "refresh_token": response.session.refresh_token if response.session else None,
        }

    async def login(self, email: str, password: str) -> dict:
        try:
            response = self.client.auth.sign_in_with_password({"email": email, "password": password})
        except AuthApiError as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid login credentials") from exc
        if not response.user or not response.session:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return {
            "user_id": uuid.UUID(response.user.id),
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
        }

    async def refresh(self, refresh_token: str) -> dict:
        try:
            response = self.client.auth.refresh_session(refresh_token)
        except AuthApiError as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc
        if not response.session:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        return {
            "user_id": uuid.UUID(response.user.id) if response.user else None,
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
        }

