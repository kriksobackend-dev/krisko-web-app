import uuid
from datetime import datetime, timezone

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import Select, select

from app.api.deps import DBSession, CurrentUser, require_role
from app.models.address import Address
from app.models.course import Course
from app.models.enums import CourseDifficulty, OrderStatus, SellerStatus, UserRole
from app.models.inventory import Inventory
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.seller import Seller
from app.models.shipment import Shipment
from app.models.user import User
from app.schemas.admin import SellerCreateRequest, SellerResponse, SellerUpdateStatusRequest
from app.schemas.admin_update import CourseUpdateRequest, OrderStatusUpdateRequest, ProductUpdateRequest
from app.schemas.course import CourseCreateRequest
from app.schemas.product import ProductCreateRequest, ProductInventoryUpdateRequest
from app.services.shipments import ShipmentService

shipment_service = ShipmentService()

router = APIRouter(prefix="/admin", tags=["admin"])

AdminAccess = Annotated[dict, Depends(require_role(UserRole.admin))]


@router.get("/metrics")
async def metrics(db: DBSession, _: AdminAccess):
    users_count = (await db.execute(select(User).where(User.deleted_at.is_(None)))).scalars().all()
    orders = (await db.execute(select(Order).where(Order.deleted_at.is_(None)))).scalars().all()
    revenue = sum(order.total_amount for order in orders if order.status.value in {"paid", "packed", "shipped", "delivered"})
    return {
        "total_users": len(users_count),
        "total_orders": len(orders),
        "total_revenue": revenue,
    }


@router.post("/sellers", response_model=SellerResponse, status_code=status.HTTP_201_CREATED)
async def create_seller(payload: SellerCreateRequest, db: DBSession, _: AdminAccess, current_user: CurrentUser):
    seller = Seller(
        display_name=payload.display_name,
        legal_name=payload.legal_name,
        gstin=payload.gstin,
        contact_email=str(payload.contact_email),
        contact_phone=payload.contact_phone,
        status=SellerStatus.pending,
        managed_by_admin_id=uuid.UUID(current_user["sub"]),
    )
    db.add(seller)
    await db.commit()
    await db.refresh(seller)
    return SellerResponse(id=seller.id, display_name=seller.display_name, contact_email=seller.contact_email, status=seller.status)


@router.patch("/sellers/{seller_id}/status", response_model=SellerResponse)
async def update_seller_status(seller_id: uuid.UUID, payload: SellerUpdateStatusRequest, db: DBSession, _: AdminAccess):
    stmt: Select[tuple[Seller]] = select(Seller).where(Seller.id == seller_id, Seller.deleted_at.is_(None))
    result = await db.execute(stmt)
    seller = result.scalar_one_or_none()
    if not seller:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seller not found")
    seller.status = payload.status
    await db.commit()
    await db.refresh(seller)
    return SellerResponse(id=seller.id, display_name=seller.display_name, contact_email=seller.contact_email, status=seller.status)


@router.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreateRequest, db: DBSession, _: AdminAccess):
    product = Product(
        seller_id=payload.seller_id,
        category_id=payload.category_id,
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        unit_price=payload.unit_price,
        unit_label=payload.unit_label,
    )
    db.add(product)
    await db.flush()
    db.add(Inventory(product_id=product.id, stock_available=0, low_stock_threshold=10))
    await db.commit()
    await db.refresh(product)
    return {"id": product.id, "name": product.name, "unit_price": product.unit_price}


@router.patch("/products/{product_id}/inventory")
async def update_inventory(
    product_id: uuid.UUID, payload: ProductInventoryUpdateRequest, db: DBSession, _: AdminAccess
):
    inventory = (
        await db.execute(select(Inventory).where(Inventory.product_id == product_id, Inventory.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if not inventory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory not found")
    inventory.stock_available = payload.stock_available
    inventory.low_stock_threshold = payload.low_stock_threshold
    await db.commit()
    return {"product_id": product_id, "stock_available": inventory.stock_available}


@router.get("/products")
async def list_products(db: DBSession, _: AdminAccess):
    products = (await db.execute(select(Product).where(Product.deleted_at.is_(None)).order_by(Product.created_at.desc()))).scalars().all()
    return [{"id": product.id, "name": product.name, "published": product.is_published, "price": product.unit_price} for product in products]


@router.delete("/products/{product_id}")
async def soft_delete_product(product_id: uuid.UUID, db: DBSession, _: AdminAccess):
    product = (await db.execute(select(Product).where(Product.id == product_id, Product.deleted_at.is_(None)))).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    product.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "Product archived"}


@router.post("/orders/{order_id}/shipment")
async def create_shipment(order_id: uuid.UUID, db: DBSession, _: AdminAccess):
    order = (await db.execute(select(Order).where(Order.id == order_id, Order.deleted_at.is_(None)))).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.shipment:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Shipment already exists")
    address = (await db.execute(select(Address).where(Address.id == order.address_id, Address.deleted_at.is_(None)))).scalar_one_or_none()
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipping address not found")
    payload = {
        "order_id": str(order.id),
        "order_date": order.created_at.strftime("%Y-%m-%d"),
        "pickup_location": "Primary",
        "billing_customer_name": address.full_name,
        "billing_address": address.line1,
        "billing_city": address.city,
        "billing_pincode": address.postal_code,
        "billing_state": address.state,
        "billing_country": address.country,
        "billing_email": "ops@krikso.com",
        "billing_phone": address.phone,
        "shipping_is_billing": True,
        "order_items": [{"name": item.product_id.hex, "sku": item.product_id.hex[:12], "units": item.quantity, "selling_price": item.unit_price} for item in order.items],
        "payment_method": "Prepaid",
        "sub_total": order.total_amount,
        "length": 10,
        "breadth": 10,
        "height": 10,
        "weight": 1
    }
    shiprocket_response = await shipment_service.client.create_shipment(payload)
    shipment = Shipment(
        order_id=order.id,
        shiprocket_order_id=str(shiprocket_response.get("order_id")),
        awb_code=str(shiprocket_response.get("awb_code")) if shiprocket_response.get("awb_code") else None,
        current_status="created",
    )
    db.add(shipment)
    await db.commit()
    await db.refresh(shipment)
    return {"shipment_id": shipment.id, "status": shipment.current_status, "shiprocket_order_id": shipment.shiprocket_order_id}


@router.post("/shipments/{shipment_id}/sync")
async def sync_shipment_tracking(shipment_id: uuid.UUID, db: DBSession, _: AdminAccess):
    shipment = (await db.execute(select(Shipment).where(Shipment.id == shipment_id, Shipment.deleted_at.is_(None)))).scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    await shipment_service.sync_tracking(shipment)
    await db.commit()
    await db.refresh(shipment)
    return {"shipment_id": shipment.id, "status": shipment.current_status, "tracking_url": shipment.tracking_url}


# ── Course Management ──

@router.post("/courses", status_code=status.HTTP_201_CREATED)
async def create_course(payload: CourseCreateRequest, db: DBSession, _: AdminAccess):
    course = Course(
        title=payload.title,
        slug=payload.slug,
        description=payload.description,
        instructor_name=payload.instructor_name,
        price=payload.price,
        duration_hours=payload.duration_hours,
        difficulty=CourseDifficulty(payload.difficulty),
        thumbnail_url=payload.thumbnail_url,
        category_tag=payload.category_tag,
        lessons_count=payload.lessons_count,
        is_published=True,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return {"id": str(course.id), "title": course.title, "price": course.price}


@router.get("/courses")
async def list_all_courses(db: DBSession, _: AdminAccess):
    courses = (
        await db.execute(select(Course).where(Course.deleted_at.is_(None)).order_by(Course.created_at.desc()))
    ).scalars().all()
    return [
        {"id": str(c.id), "title": c.title, "published": c.is_published, "price": c.price}
        for c in courses
    ]


@router.delete("/courses/{course_id}")
async def soft_delete_course(course_id: uuid.UUID, db: DBSession, _: AdminAccess):
    course = (
        await db.execute(select(Course).where(Course.id == course_id, Course.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    course.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "Course archived"}


@router.patch("/courses/{course_id}")
async def update_course(course_id: uuid.UUID, payload: CourseUpdateRequest, db: DBSession, _: AdminAccess):
    course = (
        await db.execute(select(Course).where(Course.id == course_id, Course.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        if field == "difficulty" and value is not None:
            setattr(course, field, CourseDifficulty(value))
        else:
            setattr(course, field, value)
    await db.commit()
    await db.refresh(course)
    return {"id": str(course.id), "title": course.title, "price": course.price}


# ── Product Updates ──

@router.patch("/products/{product_id}")
async def update_product(product_id: uuid.UUID, payload: ProductUpdateRequest, db: DBSession, _: AdminAccess):
    product = (
        await db.execute(select(Product).where(Product.id == product_id, Product.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    await db.commit()
    await db.refresh(product)
    return {"id": str(product.id), "name": product.name, "price": product.unit_price}


@router.delete("/products/{product_id}")
async def soft_delete_product(product_id: uuid.UUID, db: DBSession, _: AdminAccess):
    product = (
        await db.execute(select(Product).where(Product.id == product_id, Product.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    product.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "Product archived"}


# ── Orders Management ──

@router.get("/orders")
async def list_all_orders(db: DBSession, _: AdminAccess):
    from sqlalchemy.orm import selectinload
    stmt = (
        select(Order)
        .options(selectinload(Order.user), selectinload(Order.items), selectinload(Order.cancellation))
        .where(Order.deleted_at.is_(None))
        .order_by(Order.created_at.desc())
        .limit(200)
    )
    result = await db.execute(stmt)
    orders = result.scalars().all()

    # Collect all address IDs and batch-load them
    address_ids = {o.address_id for o in orders if o.address_id}
    addresses_map: dict[uuid.UUID, Address] = {}
    if address_ids:
        addr_result = await db.execute(select(Address).where(Address.id.in_(address_ids)))
        for addr in addr_result.scalars().all():
            addresses_map[addr.id] = addr

    def _serialize_address(addr: Address | None) -> dict | None:
        if not addr:
            return None
        return {
            "full_name": addr.full_name,
            "phone": addr.phone,
            "line1": addr.line1,
            "line2": addr.line2,
            "city": addr.city,
            "state": addr.state,
            "postal_code": addr.postal_code,
            "country": addr.country,
            "landmark": addr.landmark,
        }

    return [
        {
            "id": str(o.id),
            "user_name": o.user.name if o.user else "Unknown",
            "user_email": o.user.email if o.user else "",
            "status": o.status.value if o.status else "pending",
            "total_amount": o.total_amount,
            "items_count": len(o.items) if o.items else 0,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "shipping_address": _serialize_address(addresses_map.get(o.address_id)),
            "cancellation": {
                "reason": o.cancellation.reason,
                "status": o.cancellation.status.value,
                "admin_note": o.cancellation.admin_note,
            } if o.cancellation else None,
        }
        for o in orders
    ]


@router.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: uuid.UUID, payload: OrderStatusUpdateRequest, db: DBSession, _: AdminAccess
):
    order = (
        await db.execute(select(Order).where(Order.id == order_id, Order.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    try:
        order.status = OrderStatus(payload.status)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status: {payload.status}")
    await db.commit()
    return {"id": str(order.id), "status": order.status.value}


# ── Users ──

@router.get("/users")
async def list_users(db: DBSession, _: AdminAccess):
    result = await db.execute(select(User).order_by(User.created_at.desc()).limit(200))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "full_name": u.name or "",
            "email": u.email or "",
            "phone": u.phone or "",
            "role": u.role.value if u.role else "buyer",
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]
