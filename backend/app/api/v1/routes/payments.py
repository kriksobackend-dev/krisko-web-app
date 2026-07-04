import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DBSession, parse_user_id
from app.integrations.razorpay import RazorpayClient
from app.models.order import Order
from app.schemas.payment import RazorpayOrderRequest, RazorpayVerifyRequest
from app.services.payments import PaymentService

router = APIRouter(prefix="/payments", tags=["payments"])
payment_service = PaymentService()
razorpay_client = RazorpayClient()


@router.post("/razorpay/order")
async def create_payment_order(payload: RazorpayOrderRequest, user: CurrentUser):
    notes = {"user_id": user["sub"], "platform": "krikso"}
    order = await razorpay_client.create_order(amount_paise=payload.amount_paise, receipt=payload.receipt, notes=notes)
    return order


@router.post("/orders/{order_id}/verify")
async def verify_order_payment(order_id: uuid.UUID, payload: RazorpayVerifyRequest, db: DBSession, user: CurrentUser):
    db_order = (
        await db.execute(select(Order).where(Order.id == order_id, Order.user_id == parse_user_id(user), Order.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if not db_order or not db_order.payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order payment not found")
    await payment_service.verify_razorpay_payment(
        payment=db_order.payment,
        order_id=payload.provider_order_id,
        payment_id=payload.provider_payment_id,
        signature=payload.provider_signature,
    )
    await db.commit()
    await db.refresh(db_order.payment)
    return {"payment_status": db_order.payment.status}

