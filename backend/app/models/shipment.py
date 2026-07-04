import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampSoftDeleteMixin


class Shipment(Base, TimestampSoftDeleteMixin):
    __tablename__ = "shipments"

    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id"), unique=True, index=True, nullable=False)
    shiprocket_order_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    awb_code: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    courier_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    tracking_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    current_status: Mapped[str] = mapped_column(String(120), default="pending")
    raw_tracking_payload: Mapped[str | None] = mapped_column(Text, nullable=True)

    order = relationship("Order", back_populates="shipment")

