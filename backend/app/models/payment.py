import uuid

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampSoftDeleteMixin
from app.models.enums import PaymentMethod, PaymentStatus


class Payment(Base, TimestampSoftDeleteMixin):
    __tablename__ = "payments"

    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id"), unique=True, index=True, nullable=False)
    method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod), nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), index=True, default=PaymentStatus.pending)
    provider_payment_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    provider_order_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    provider_signature: Mapped[str | None] = mapped_column(String(255), nullable=True)
    refund_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    order = relationship("Order", back_populates="payment")

