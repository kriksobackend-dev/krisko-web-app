from typing import Any

import httpx

from app.core.config import get_settings


class ShiprocketClient:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.base_url = self.settings.shiprocket_base_url
        self._token: str | None = None

    async def _authenticate(self) -> str:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                f"{self.base_url}/auth/login",
                json={"email": self.settings.shiprocket_email, "password": self.settings.shiprocket_password},
            )
            response.raise_for_status()
            token = response.json()["token"]
            self._token = token
            return token

    async def _headers(self) -> dict[str, str]:
        token = self._token or await self._authenticate()
        return {"Authorization": f"Bearer {token}"}

    async def create_shipment(self, payload: dict[str, Any]) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(f"{self.base_url}/orders/create/adhoc", json=payload, headers=await self._headers())
            response.raise_for_status()
            return response.json()

    async def track_awb(self, awb_code: str) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(f"{self.base_url}/courier/track/awb/{awb_code}", headers=await self._headers())
            response.raise_for_status()
            return response.json()

    async def cancel_order(self, shiprocket_order_ids: list[str]) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                f"{self.base_url}/orders/cancel",
                json={"ids": shiprocket_order_ids},
                headers=await self._headers()
            )
            response.raise_for_status()
            return response.json()


