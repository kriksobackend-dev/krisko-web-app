from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import Select, select

from app.api.deps import DBSession
from app.models.course import Course

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("")
async def list_courses(
    db: DBSession,
    q: str | None = Query(default=None),
    difficulty: str | None = Query(default=None),
    category_tag: str | None = Query(default=None),
    sort: str = Query(default="latest"),
):
    stmt: Select[tuple[Course]] = select(Course).where(
        Course.deleted_at.is_(None), Course.is_published.is_(True)
    )
    if q:
        stmt = stmt.where(Course.title.ilike(f"%{q}%"))
    if difficulty:
        stmt = stmt.where(Course.difficulty == difficulty)
    if category_tag:
        stmt = stmt.where(Course.category_tag == category_tag)
    if sort == "price_asc":
        stmt = stmt.order_by(Course.price.asc())
    elif sort == "price_desc":
        stmt = stmt.order_by(Course.price.desc())
    elif sort == "rating":
        stmt = stmt.order_by(Course.avg_rating.desc())
    else:
        stmt = stmt.order_by(Course.created_at.desc())

    result = await db.execute(stmt.limit(50))
    courses = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "title": c.title,
            "slug": c.slug,
            "description": c.description,
            "instructor_name": c.instructor_name,
            "price": c.price,
            "duration_hours": c.duration_hours,
            "difficulty": c.difficulty.value if c.difficulty else "beginner",
            "thumbnail_url": c.thumbnail_url,
            "category_tag": c.category_tag,
            "lessons_count": c.lessons_count,
            "avg_rating": c.avg_rating,
        }
        for c in courses
    ]


@router.get("/{course_id}")
async def get_course(course_id: str, db: DBSession):
    stmt = select(Course).where(Course.id == course_id, Course.deleted_at.is_(None))
    result = await db.execute(stmt)
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return {
        "id": str(course.id),
        "title": course.title,
        "slug": course.slug,
        "description": course.description,
        "instructor_name": course.instructor_name,
        "price": course.price,
        "duration_hours": course.duration_hours,
        "difficulty": course.difficulty.value if course.difficulty else "beginner",
        "thumbnail_url": course.thumbnail_url,
        "is_published": course.is_published,
        "category_tag": course.category_tag,
        "lessons_count": course.lessons_count,
        "avg_rating": course.avg_rating,
    }
