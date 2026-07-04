from fastapi import APIRouter

from app.api.v1.routes import admin, auth, courses, marketplace, orders, payments, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(marketplace.router)
api_router.include_router(courses.router)
api_router.include_router(orders.router)
api_router.include_router(payments.router)
api_router.include_router(admin.router)
api_router.include_router(users.router)

