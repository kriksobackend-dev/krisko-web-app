from pydantic import BaseModel


class ProductUpdateRequest(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    unit_price: float | None = None
    unit_label: str | None = None
    is_published: bool | None = None


class CourseUpdateRequest(BaseModel):
    title: str | None = None
    slug: str | None = None
    description: str | None = None
    instructor_name: str | None = None
    price: float | None = None
    duration_hours: float | None = None
    difficulty: str | None = None
    thumbnail_url: str | None = None
    category_tag: str | None = None
    lessons_count: int | None = None
    is_published: bool | None = None


class OrderStatusUpdateRequest(BaseModel):
    status: str
