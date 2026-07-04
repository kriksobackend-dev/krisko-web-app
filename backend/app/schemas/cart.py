import uuid

from pydantic import BaseModel

from app.models.enums import PaymentMethod


class OrderItemPayload(BaseModel):
    product_id: uuid.UUID
    quantity: int


class CreateOrderRequest(BaseModel):
    address_id: uuid.UUID
    payment_method: PaymentMethod = PaymentMethod.cod
    items: list[OrderItemPayload]
    notes: str | None = None
