import json

from app.integrations.shiprocket import ShiprocketClient
from app.models.shipment import Shipment


class ShipmentService:
    def __init__(self) -> None:
        self.client = ShiprocketClient()

    async def sync_tracking(self, shipment: Shipment) -> Shipment:
        if not shipment.awb_code:
            return shipment
        payload = await self.client.track_awb(shipment.awb_code)
        shipment.raw_tracking_payload = json.dumps(payload)
        shipment.current_status = payload.get("tracking_data", {}).get("track_status", "pending")
        shipment.tracking_url = payload.get("tracking_data", {}).get("track_url")
        return shipment

