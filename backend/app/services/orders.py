import uuid
import logging
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import CancellationStatus, OrderStatus, PaymentMethod
from app.models.order import Order, OrderCancellation
from app.repositories.orders import OrderRepository
from app.services.payments import PaymentService
from app.integrations.shiprocket import ShiprocketClient

logger = logging.getLogger(__name__)


class OrderService:
    cancellable_statuses = {OrderStatus.pending, OrderStatus.paid, OrderStatus.packed}

    def __init__(self) -> None:
        self.repo = OrderRepository()
        self.payment_service = PaymentService()
        self.shiprocket_client = ShiprocketClient()

    async def cancel_order(
        self, db: AsyncSession, order_id: uuid.UUID, user_id: uuid.UUID, reason: str
    ) -> OrderCancellation:
        order = await self.repo.get_order_for_user(db, order_id, user_id)
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        if order.status not in self.cancellable_statuses:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Order can no longer be cancelled")
        if order.cancellation:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cancellation already requested")

        cancellation = OrderCancellation(
            order_id=order.id,
            reason=reason,
            status=CancellationStatus.requested,
        )
        db.add(cancellation)

        await db.commit()
        await db.refresh(cancellation)
        return cancellation

    async def list_cancelled_orders_for_user(self, db: AsyncSession, user_id: uuid.UUID) -> list[OrderCancellation]:
        return await self.repo.get_cancelled_orders_for_user(db, user_id)

    async def list_cancelled_orders_admin(self, db: AsyncSession) -> list[OrderCancellation]:
        return await self.repo.get_cancelled_orders_admin(db)

    async def list_orders_for_user(self, db: AsyncSession, user_id: uuid.UUID) -> list[Order]:
        return await self.repo.list_orders_for_user(db, user_id)

    async def admin_update_cancellation(
        self, db: AsyncSession, order_id: uuid.UUID, approve: bool, admin_note: str | None = None
    ) -> OrderCancellation:
        order = await self.repo.get_order_by_id(db, order_id)
        if not order or not order.cancellation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cancellation not found")
        order.cancellation.status = CancellationStatus.approved if approve else CancellationStatus.rejected
        order.cancellation.admin_note = admin_note
        if approve:
            order.status = OrderStatus.cancelled
            
            # Automatically cancel in Shiprocket if a shipment exists
            if order.shipment and order.shipment.shiprocket_order_id:
                try:
                    await self.shiprocket_client.cancel_order([order.shipment.shiprocket_order_id])
                    order.shipment.current_status = "cancelled"
                    logger.info(f"Successfully cancelled Shiprocket order {order.shipment.shiprocket_order_id} for Order {order.id}")
                except Exception as e:
                    logger.error(f"Error calling Shiprocket cancel API for Order {order.id}: {e}", exc_info=True)
            
            if order.payment and order.payment.method == PaymentMethod.razorpay:
                await self.payment_service.initiate_refund(db, order.payment)
                order.cancellation.status = CancellationStatus.refunded
        await db.commit()
        await db.refresh(order.cancellation)
        return order.cancellation


