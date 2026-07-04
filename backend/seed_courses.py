"""Seed sample farming courses into the database."""
import asyncio
import uuid
from datetime import datetime, timezone

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[0]))

from app.db.session import AsyncSessionLocal
from app.models.course import Course
from app.models.enums import CourseDifficulty

COURSES = [
    {
        "title": "Organic Farming Masterclass",
        "slug": "organic-farming-masterclass",
        "description": "Learn the complete A-to-Z of organic farming — from soil preparation and composting to pest management and certification. This comprehensive course covers natural fertilizers, crop rotation techniques, and how to transition your farm to fully organic practices. Ideal for farmers looking to increase yield quality and command premium prices.",
        "instructor_name": "Dr. Ramesh Sharma",
        "price": 1499.0,
        "duration_hours": 12.5,
        "difficulty": CourseDifficulty.beginner,
        "thumbnail_url": None,
        "category_tag": "organic-farming",
        "lessons_count": 24,
        "avg_rating": 4.8,
    },
    {
        "title": "Modern Irrigation Techniques",
        "slug": "modern-irrigation-techniques",
        "description": "Master drip irrigation, sprinkler systems, and smart water management. This course teaches you how to reduce water usage by up to 60% while improving crop yield. Includes hands-on guidance on system installation, maintenance, and government subsidy schemes available for irrigation equipment.",
        "instructor_name": "Prof. Anita Desai",
        "price": 999.0,
        "duration_hours": 8.0,
        "difficulty": CourseDifficulty.intermediate,
        "thumbnail_url": None,
        "category_tag": "irrigation",
        "lessons_count": 16,
        "avg_rating": 4.6,
    },
    {
        "title": "Crop Disease Management",
        "slug": "crop-disease-management",
        "description": "Identify, prevent, and treat common crop diseases affecting Indian agriculture. Learn about integrated pest management (IPM), biological control agents, and safe pesticide application. Covers diseases in rice, wheat, cotton, vegetables, and fruit crops with real field case studies.",
        "instructor_name": "Dr. Suresh Patel",
        "price": 799.0,
        "duration_hours": 6.5,
        "difficulty": CourseDifficulty.intermediate,
        "thumbnail_url": None,
        "category_tag": "crop-management",
        "lessons_count": 14,
        "avg_rating": 4.5,
    },
    {
        "title": "Smart Farming with IoT & Drones",
        "slug": "smart-farming-iot-drones",
        "description": "Discover how technology is revolutionizing agriculture. Learn to use IoT sensors for soil monitoring, drones for crop surveillance, and data analytics for precision farming. This advanced course prepares you for the future of Indian agriculture with practical, affordable tech solutions.",
        "instructor_name": "Vikram Mehra",
        "price": 2499.0,
        "duration_hours": 15.0,
        "difficulty": CourseDifficulty.advanced,
        "thumbnail_url": None,
        "category_tag": "smart-farming",
        "lessons_count": 30,
        "avg_rating": 4.9,
    },
    {
        "title": "Soil Health & Fertility Management",
        "slug": "soil-health-fertility-management",
        "description": "Understand your soil like never before. Learn soil testing, pH balancing, nutrient management, and how to build long-term soil fertility. This course covers both chemical and organic approaches to maintaining healthy, productive farmland season after season.",
        "instructor_name": "Dr. Kavita Reddy",
        "price": 699.0,
        "duration_hours": 5.0,
        "difficulty": CourseDifficulty.beginner,
        "thumbnail_url": None,
        "category_tag": "soil-management",
        "lessons_count": 10,
        "avg_rating": 4.7,
    },
    {
        "title": "Greenhouse & Polyhouse Farming",
        "slug": "greenhouse-polyhouse-farming",
        "description": "Start your protected cultivation journey. Learn to set up and manage greenhouses and polyhouses for year-round vegetable and flower production. Covers climate control, hydroponic basics, cost analysis, and ROI calculations for Indian conditions.",
        "instructor_name": "Arun Joshi",
        "price": 1999.0,
        "duration_hours": 10.0,
        "difficulty": CourseDifficulty.advanced,
        "thumbnail_url": None,
        "category_tag": "protected-farming",
        "lessons_count": 20,
        "avg_rating": 4.4,
    },
    {
        "title": "Seed Selection & Crop Planning",
        "slug": "seed-selection-crop-planning",
        "description": "Choose the right seeds for maximum yield. Learn about hybrid vs. open-pollinated varieties, seed treatment techniques, and seasonal crop planning. Includes regional guides for major Indian agro-climatic zones and market-demand based crop selection strategies.",
        "instructor_name": "Dr. Ramesh Sharma",
        "price": 599.0,
        "duration_hours": 4.5,
        "difficulty": CourseDifficulty.beginner,
        "thumbnail_url": None,
        "category_tag": "crop-management",
        "lessons_count": 9,
        "avg_rating": 4.3,
    },
    {
        "title": "Farm Business & Marketing",
        "slug": "farm-business-marketing",
        "description": "Transform your farm into a profitable business. Learn direct-to-consumer marketing, farm branding, e-commerce for agriculture, government scheme applications, and financial planning for farmers. Includes real success stories from Indian farmer entrepreneurs.",
        "instructor_name": "Priya Nair",
        "price": 1299.0,
        "duration_hours": 9.0,
        "difficulty": CourseDifficulty.intermediate,
        "thumbnail_url": None,
        "category_tag": "business",
        "lessons_count": 18,
        "avg_rating": 4.6,
    },
]


async def seed():
    async with AsyncSessionLocal() as session:
        for course_data in COURSES:
            course = Course(
                id=uuid.uuid4(),
                **course_data,
                is_published=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            session.add(course)
        await session.commit()
        print(f"✅ Seeded {len(COURSES)} courses successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
