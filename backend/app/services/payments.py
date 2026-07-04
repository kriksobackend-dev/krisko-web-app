from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.integrations.razorpay import RazorpayClient
from app.models.enums import PaymentStatus
from app.models.payment import Payment


class PaymentService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.client = RazorpayClient()

    async def verify_razorpay_payment(self, payment: Payment, order_id: str, payment_id: str, signature: str) -> None:
        if not self.client.verify_signature(order_id, payment_id, signature, self.settings.razorpay_key_secret):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Razorpay signature")
        payment.provider_order_id = order_id
        payment.provider_payment_id = payment_id
        payment.provider_signature = signature
        payment.status = PaymentStatus.success

    async def initiate_refund(self, db: AsyncSession, payment: Payment) -> None:
        if payment.status != PaymentStatus.success:
            return
        payment.status = PaymentStatus.refund_initiated
        await db.flush()

