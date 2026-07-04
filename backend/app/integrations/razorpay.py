import hashlib
import hmac
from base64 import b64encode
from typing import Any

import httpx

from app.core.config import get_settings


class RazorpayClient:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.base_url = "https://api.razorpay.com/v1"
        auth_bytes = f"{self.settings.razorpay_key_id}:{self.settings.razorpay_key_secret}".encode()
        self.auth_header = b64encode(auth_bytes).decode()

    async def create_order(self, amount_paise: int, receipt: str, notes: dict[str, str] | None = None) -> dict[str, Any]:
        payload = {"amount": amount_paise, "currency": "INR", "receipt": receipt, "notes": notes or {}}
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                f"{self.base_url}/orders",
                json=payload,
                headers={"Authorization": f"Basic {self.auth_header}"},
            )
            response.raise_for_status()
            return response.json()

    @staticmethod
    def verify_signature(order_id: str, payment_id: str, signature: str, key_secret: str) -> bool:
        body = f"{order_id}|{payment_id}".encode()
        expected = hmac.new(key_secret.encode(), body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)

