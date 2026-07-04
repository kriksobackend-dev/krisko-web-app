from pydantic import BaseModel


class RazorpayOrderRequest(BaseModel):
    amount_paise: int
    receipt: str


class RazorpayVerifyRequest(BaseModel):
    provider_order_id: str
    provider_payment_id: str
    provider_signature: str

