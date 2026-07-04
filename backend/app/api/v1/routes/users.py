from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DBSession, parse_user_id
from app.models.address import Address
from app.models.user import User
from app.schemas.user import AddressCreateRequest, AddressResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
async def profile(db: DBSession, user: CurrentUser):
    user_id = parse_user_id(user)
    db_user = (await db.execute(select(User).where(User.id == user_id, User.deleted_at.is_(None)))).scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    return {"id": db_user.id, "name": db_user.name, "email": db_user.email, "phone": db_user.phone}


@router.get("/me/addresses", response_model=list[AddressResponse])
async def list_addresses(db: DBSession, user: CurrentUser):
    user_id = parse_user_id(user)
    addresses = (
        await db.execute(
            select(Address).where(Address.user_id == user_id, Address.deleted_at.is_(None)).order_by(Address.created_at.desc())
        )
    ).scalars().all()
    return [
        AddressResponse(
            id=address.id,
            full_name=address.full_name,
            phone=address.phone,
            line1=address.line1,
            city=address.city,
            state=address.state,
            postal_code=address.postal_code,
            country=address.country,
        )
        for address in addresses
    ]


@router.post("/me/addresses", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
async def create_address(payload: AddressCreateRequest, db: DBSession, user: CurrentUser):
    user_id = parse_user_id(user)
    address = Address(user_id=user_id, **payload.model_dump())
    db.add(address)
    await db.commit()
    await db.refresh(address)
    return AddressResponse(
        id=address.id,
        full_name=address.full_name,
        phone=address.phone,
        line1=address.line1,
        city=address.city,
        state=address.state,
        postal_code=address.postal_code,
        country=address.country,
    )

