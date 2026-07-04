import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.enums import CancellationStatus, OrderStatus, PaymentStatus


class CancelOrderRequest(BaseModel):
    reason: str


class CancellationResponse(BaseModel):
    order_id: uuid.UUID
    order_status: OrderStatus
    cancellation_status: CancellationStatus
    refund_status: PaymentStatus | None = None
    updated_at: datetime


class CancelledOrderItem(BaseModel):
    order_id: uuid.UUID
    cancellation_status: CancellationStatus
    cancellation_reason: str
    order_status: OrderStatus
    total_amount: float
    created_at: datetime


class OrderSummaryItem(BaseModel):
    order_id: uuid.UUID
    order_status: OrderStatus
    total_amount: float
    payment_status: PaymentStatus | None = None
    shipment_status: str | None = None
    refund_status: PaymentStatus | None = None
    created_at: datetime


class CancellationReviewRequest(BaseModel):
    approve: bool
    admin_note: str | None = None

