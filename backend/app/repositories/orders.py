import uuid

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderCancellation


class OrderRepository:
    async def get_order_for_user(self, db: AsyncSession, order_id: uuid.UUID, user_id: uuid.UUID) -> Order | None:
        stmt: Select[tuple[Order]] = select(Order).where(
            Order.id == order_id, Order.user_id == user_id, Order.deleted_at.is_(None)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_order_by_id(self, db: AsyncSession, order_id: uuid.UUID) -> Order | None:
        stmt = select(Order).where(Order.id == order_id, Order.deleted_at.is_(None))
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_cancelled_orders_for_user(self, db: AsyncSession, user_id: uuid.UUID) -> list[OrderCancellation]:
        stmt: Select[tuple[OrderCancellation]] = (
            select(OrderCancellation)
            .join(Order, OrderCancellation.order_id == Order.id)
            .where(Order.user_id == user_id, OrderCancellation.deleted_at.is_(None))
            .order_by(OrderCancellation.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_cancelled_orders_admin(self, db: AsyncSession) -> list[OrderCancellation]:
        stmt = select(OrderCancellation).where(OrderCancellation.deleted_at.is_(None)).order_by(
            OrderCancellation.created_at.desc()
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def list_orders_for_user(self, db: AsyncSession, user_id: uuid.UUID) -> list[Order]:
        stmt = select(Order).where(Order.user_id == user_id, Order.deleted_at.is_(None)).order_by(Order.created_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

