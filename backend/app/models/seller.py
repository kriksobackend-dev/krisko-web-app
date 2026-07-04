import uuid

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampSoftDeleteMixin
from app.models.enums import SellerStatus


class Seller(Base, TimestampSoftDeleteMixin):
    __tablename__ = "sellers"

    display_name: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    legal_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    gstin: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    contact_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[SellerStatus] = mapped_column(Enum(SellerStatus), default=SellerStatus.pending, index=True)
    managed_by_admin_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    products = relationship("Product", back_populates="seller", lazy="selectin")

