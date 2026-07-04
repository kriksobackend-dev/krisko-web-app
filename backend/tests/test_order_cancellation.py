from app.models.enums import OrderStatus
from app.services.orders import OrderService


def test_cancellable_statuses() -> None:
    service = OrderService()
    assert OrderStatus.pending in service.cancellable_statuses
    assert OrderStatus.paid in service.cancellable_statuses
    assert OrderStatus.packed in service.cancellable_statuses
    assert OrderStatus.shipped not in service.cancellable_statuses
    assert OrderStatus.delivered not in service.cancellable_statuses

