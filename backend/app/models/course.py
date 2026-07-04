import uuid

from sqlalchemy import Boolean, Enum, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampSoftDeleteMixin
from app.models.enums import CourseDifficulty


class Course(Base, TimestampSoftDeleteMixin):
    __tablename__ = "courses"

    title: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    instructor_name: Mapped[str] = mapped_column(String(200), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    duration_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    difficulty: Mapped[CourseDifficulty] = mapped_column(
        Enum(CourseDifficulty), default=CourseDifficulty.beginner, index=True
    )
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    category_tag: Mapped[str] = mapped_column(String(100), index=True, default="general", nullable=False)
    lessons_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    avg_rating: Mapped[float] = mapped_column(Float, default=0.0)
