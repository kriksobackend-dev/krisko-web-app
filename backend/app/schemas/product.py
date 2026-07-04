import uuid

from pydantic import BaseModel


class ProductCreateRequest(BaseModel):
    seller_id: uuid.UUID
    category_id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    unit_price: float
    unit_label: str = "kg"


class ProductInventoryUpdateRequest(BaseModel):
    stock_available: int
    low_stock_threshold: int = 10

