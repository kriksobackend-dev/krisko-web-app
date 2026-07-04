import uuid

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DBSession, parse_user_id, require_role
from app.models.enums import OrderStatus, PaymentMethod, PaymentStatus, UserRole
from app.models.order import Order, OrderItem
from app.models.payment import Payment
from app.models.product import Product
from app.schemas.cart import CreateOrderRequest
from app.schemas.order import (
    CancellationReviewRequest,
    CancelOrderRequest,
    CancelledOrderItem,
    CancellationResponse,
    OrderSummaryItem,
)
from app.services.orders import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])
service = OrderService()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_order(payload: CreateOrderRequest, db: DBSession, user: CurrentUser):
    user_id = parse_user_id(user)

    # Validate products and calculate total
    total_amount = 0.0
    order_items_data: list[dict] = []
    for item in payload.items:
        product = (
            await db.execute(
                select(Product).where(Product.id == item.product_id, Product.deleted_at.is_(None), Product.is_published.is_(True))
            )
        ).scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {item.product_id} not found")
        if product.inventory and product.inventory.stock_available < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Insufficient stock for {product.name}",
            )
        line_total = product.unit_price * item.quantity
        total_amount += line_total
        order_items_data.append({"product_id": product.id, "quantity": item.quantity, "unit_price": product.unit_price})

    # Create order
    order = Order(
        user_id=user_id,
        address_id=payload.address_id,
        status=OrderStatus.pending,
        total_amount=total_amount,
        notes=payload.notes,
    )
    db.add(order)
    await db.flush()

    # Create order items
    for oi in order_items_data:
        db.add(OrderItem(order_id=order.id, **oi))

    # Create payment record
    payment = Payment(
        order_id=order.id,
        method=payload.payment_method,
        status=PaymentStatus.pending,
    )
    db.add(payment)

    # Deduct stock
    for oi in order_items_data:
        product = (await db.execute(select(Product).where(Product.id == oi["product_id"]))).scalar_one()
        if product.inventory:
            product.inventory.stock_available -= oi["quantity"]

    await db.commit()
    await db.refresh(order)
    return {
        "order_id": str(order.id),
        "status": order.status.value,
        "total_amount": order.total_amount,
        "payment_method": payload.payment_method.value,
    }


@router.post("/{order_id}/cancel", response_model=CancellationResponse)
async def cancel_order(
    order_id: uuid.UUID, payload: CancelOrderRequest, db: DBSession, user: CurrentUser
) -> CancellationResponse:
    cancellation = await service.cancel_order(db, order_id=order_id, user_id=parse_user_id(user), reason=payload.reason)
    order = cancellation.order
    return CancellationResponse(
        order_id=order.id,
        order_status=order.status,
        cancellation_status=cancellation.status,
        refund_status=order.payment.status if order.payment else None,
        updated_at=cancellation.updated_at,
    )


@router.get("/cancelled", response_model=list[CancelledOrderItem])
async def list_cancelled_orders(db: DBSession, user: CurrentUser) -> list[CancelledOrderItem]:
    orders = await service.list_cancelled_orders_for_user(db, parse_user_id(user))
    return [
        CancelledOrderItem(
            order_id=item.order_id,
            cancellation_status=item.status,
            cancellation_reason=item.reason,
            order_status=item.order.status,
            total_amount=item.order.total_amount,
            created_at=item.created_at,
        )
        for item in orders
    ]


@router.get("/my", response_model=list[OrderSummaryItem])
async def my_orders(db: DBSession, user: CurrentUser) -> list[OrderSummaryItem]:
    orders = await service.list_orders_for_user(db, parse_user_id(user))
    return [
        OrderSummaryItem(
            order_id=order.id,
            order_status=order.status,
            total_amount=order.total_amount,
            payment_status=order.payment.status if order.payment else None,
            shipment_status=order.shipment.current_status if order.shipment else None,
            refund_status=order.payment.status if order.payment else None,
            created_at=order.created_at,
        )
        for order in orders
    ]


@router.get("/admin/cancelled", response_model=list[CancelledOrderItem])
async def admin_list_cancelled_orders(
    db: DBSession,
    _: Annotated[dict, Depends(require_role(UserRole.admin))],
) -> list[CancelledOrderItem]:
    orders = await service.list_cancelled_orders_admin(db)
    return [
        CancelledOrderItem(
            order_id=item.order_id,
            cancellation_status=item.status,
            cancellation_reason=item.reason,
            order_status=item.order.status,
            total_amount=item.order.total_amount,
            created_at=item.created_at,
        )
        for item in orders
    ]


@router.post("/admin/{order_id}/cancellation-review", response_model=CancellationResponse)
async def admin_review_cancellation(
    order_id: uuid.UUID,
    payload: CancellationReviewRequest,
    db: DBSession,
    _: Annotated[dict, Depends(require_role(UserRole.admin))],
) -> CancellationResponse:
    cancellation = await service.admin_update_cancellation(
        db=db, order_id=order_id, approve=payload.approve, admin_note=payload.admin_note
    )
    order = cancellation.order
    return CancellationResponse(
        order_id=order.id,
        order_status=order.status,
        cancellation_status=cancellation.status,
        refund_status=order.payment.status if order.payment else None,
        updated_at=cancellation.updated_at,
    )

