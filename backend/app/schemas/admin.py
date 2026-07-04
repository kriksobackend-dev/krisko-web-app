import uuid

from pydantic import BaseModel, EmailStr

from app.models.enums import SellerStatus


class SellerCreateRequest(BaseModel):
    display_name: str
    legal_name: str | None = None
    gstin: str | None = None
    contact_email: EmailStr
    contact_phone: str | None = None


class SellerUpdateStatusRequest(BaseModel):
    status: SellerStatus


class SellerResponse(BaseModel):
    id: uuid.UUID
    display_name: str
    contact_email: EmailStr
    status: SellerStatus

