import uuid

from pydantic import BaseModel


class AddressCreateRequest(BaseModel):
    full_name: str
    phone: str
    line1: str
    line2: str | None = None
    city: str
    state: str
    postal_code: str
    country: str = "India"


class AddressResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    phone: str
    line1: str
    city: str
    state: str
    postal_code: str
    country: str

