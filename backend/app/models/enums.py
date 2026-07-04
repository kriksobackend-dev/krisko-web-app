from enum import Enum


class UserRole(str, Enum):
    customer = "customer"
    admin = "admin"


class SellerStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    blocked = "blocked"


class OrderStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    packed = "packed"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class PaymentMethod(str, Enum):
    razorpay = "razorpay"
    cod = "cod"


class PaymentStatus(str, Enum):
    pending = "pending"
    success = "success"
    failed = "failed"
    refund_initiated = "refund_initiated"
    refunded = "refunded"


class CancellationStatus(str, Enum):
    requested = "requested"
    approved = "approved"
    rejected = "rejected"
    refunded = "refunded"


class CourseDifficulty(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

