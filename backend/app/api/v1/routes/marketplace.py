from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import Select, select

from app.api.deps import DBSession
from app.models.category import Category
from app.models.product import Product

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


@router.get("/categories")
async def list_categories(db: DBSession):
    result = await db.execute(
        select(Category).where(Category.deleted_at.is_(None)).order_by(Category.name.asc())
    )
    categories = result.scalars().all()
    return [
        {
            "id": str(cat.id),
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
        }
        for cat in categories
    ]


@router.get("/products")
async def list_products(
    db: DBSession,
    q: str | None = Query(default=None),
    category_id: str | None = Query(default=None),
    sort: str = Query(default="latest"),
):
    stmt: Select[tuple[Product]] = select(Product).where(Product.deleted_at.is_(None), Product.is_published.is_(True))
    if q:
        stmt = stmt.where(Product.name.ilike(f"%{q}%"))
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if sort == "price_asc":
        stmt = stmt.order_by(Product.unit_price.asc())
    elif sort == "price_desc":
        stmt = stmt.order_by(Product.unit_price.desc())
    else:
        stmt = stmt.order_by(Product.created_at.desc())

    result = await db.execute(stmt.limit(50))
    products = result.scalars().all()
    return [
        {
            "id": str(item.id),
            "name": item.name,
            "slug": item.slug,
            "unit_price": item.unit_price,
            "unit_label": item.unit_label,
            "avg_rating": item.avg_rating,
            "image": item.images[0].image_url if item.images else None,
        }
        for item in products
    ]


@router.get("/products/{product_id}")
async def get_product(product_id: str, db: DBSession):
    stmt = select(Product).where(Product.id == product_id, Product.deleted_at.is_(None))
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return {
        "id": str(product.id),
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "unit_price": product.unit_price,
        "unit_label": product.unit_label,
        "avg_rating": product.avg_rating,
        "is_published": product.is_published,
        "category_id": str(product.category_id) if product.category_id else None,
        "seller_id": str(product.seller_id) if product.seller_id else None,
        "images": [{"id": str(img.id), "image_url": img.image_url, "sort_order": img.sort_order} for img in (product.images or [])],
        "inventory": {
            "stock_available": product.inventory.stock_available,
            "low_stock_threshold": product.inventory.low_stock_threshold,
        } if product.inventory else None,
        "reviews": [
            {"rating": r.rating, "comment": r.comment}
            for r in (product.reviews or [])
        ],
    }


