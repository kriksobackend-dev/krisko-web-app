from pydantic import BaseModel


class CourseCreateRequest(BaseModel):
    title: str
    slug: str
    description: str | None = None
    instructor_name: str
    price: float
    duration_hours: float = 0.0
    difficulty: str = "beginner"
    thumbnail_url: str | None = None
    category_tag: str = "general"
    lessons_count: int = 0
