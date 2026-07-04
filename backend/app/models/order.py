import uuid

from sqlalchemy import Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampSoftDeleteMixin
from app.models.enums import CancellationStatus, OrderStatus


class Order(Base, TimestampSoftDeleteMixin):
    __tablename__ = "orders"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    address_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("addresses.id"), nullable=False)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), index=True, default=OrderStatus.pending)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", lazy="selectin")
    payment = relationship("Payment", back_populates="order", uselist=False, lazy="selectin")
    shipment = relationship("Shipment", back_populates="order", uselist=False, lazy="selectin")
    cancellation = relationship("OrderCancellation", back_populates="order", uselist=False, lazy="selectin")


class OrderItem(Base, TimestampSoftDeleteMixin):
    __tablename__ = "order_items"

    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id"), index=True, nullable=False)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"), index=True, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)

    order = relationship("Order", back_populates="items")


class OrderCancellation(Base, TimestampSoftDeleteMixin):
    __tablename__ = "order_cancellations"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id"), unique=True, index=True, nullable=False
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[CancellationStatus] = mapped_column(
        Enum(CancellationStatus), default=CancellationStatus.requested, index=True
    )
    admin_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    order = relationship("Order", back_populates="cancellation", lazy="selectin")

