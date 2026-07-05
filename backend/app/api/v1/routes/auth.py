import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.deps import DBSession
from app.core.config import get_settings
from app.core.security import create_access_token
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
)
from app.services.auth import SupabaseAuthService

router = APIRouter(prefix="/auth", tags=["auth"])
auth_service = SupabaseAuthService()


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: SignupRequest, db: DBSession) -> TokenResponse:
    auth_resp = await auth_service.signup(payload.email, payload.password, {"name": payload.name})
    user = User(
        id=auth_resp["user_id"],
        supabase_user_id=auth_resp["user_id"],
        email=payload.email,
        name=payload.name,
        phone=payload.phone,
        role=UserRole.customer,
    )
    db.add(user)
    await db.commit()
    access_token = create_access_token(subject=str(user.id), role=user.role.value)
    return TokenResponse(access_token=access_token, refresh_token=auth_resp["refresh_token"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: DBSession) -> TokenResponse:
    auth_resp = await auth_service.login(payload.email, payload.password)
    supabase_user_id = uuid.UUID(str(auth_resp["user_id"]))
    user_q = await db.execute(select(User).where(User.supabase_user_id == supabase_user_id, User.deleted_at.is_(None)))
    user = user_q.scalar_one_or_none()
    if not user:
        # If a user with same email exists (e.g. created earlier), link it to current Supabase user.
        existing_by_email_q = await db.execute(
            select(User).where(User.email == payload.email, User.deleted_at.is_(None))
        )
        existing_by_email = existing_by_email_q.scalar_one_or_none()
        if existing_by_email:
            existing_by_email.supabase_user_id = supabase_user_id
            user = existing_by_email
        else:
            # Auto-create user profile on first login if not exists.
            user = User(
                id=supabase_user_id,
                supabase_user_id=supabase_user_id,
                email=payload.email,
                name=payload.email.split("@")[0],
                role=UserRole.customer,
            )
            db.add(user)
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            user = (
                await db.execute(
                    select(User).where(
                        (User.supabase_user_id == supabase_user_id) | (User.email == payload.email),
                        User.deleted_at.is_(None),
                    )
                )
            ).scalar_one_or_none()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Unable to synchronize user profile for login",
                )
    access_token = create_access_token(subject=str(user.id), role=user.role.value)
    return TokenResponse(access_token=access_token, refresh_token=auth_resp["refresh_token"])


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshTokenRequest, db: DBSession) -> TokenResponse:
    refreshed = await auth_service.refresh(payload.refresh_token)
    decoded_user_id = uuid.UUID(str(refreshed["user_id"])) if refreshed.get("user_id") else None
    if not decoded_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unable to refresh session")
    user = (
        await db.execute(select(User).where(User.supabase_user_id == decoded_user_id, User.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    access_token = create_access_token(subject=str(user.id), role=user.role.value)
    return TokenResponse(access_token=access_token, refresh_token=refreshed["refresh_token"])


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(payload: ForgotPasswordRequest) -> MessageResponse:
    settings = get_settings()
    redirect_url = f"{settings.frontend_url.rstrip('/')}/reset-password"
    try:
        await auth_service.reset_password_for_email(payload.email, redirect_url)
    except Exception:
        # Swallow errors to prevent email enumeration
        pass
    return MessageResponse(message="If an account with that email exists, a password reset link has been sent.")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(payload: ResetPasswordRequest) -> MessageResponse:
    await auth_service.update_user_password(payload.access_token, payload.new_password)
    return MessageResponse(message="Password has been reset successfully.")
