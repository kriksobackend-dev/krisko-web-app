export type Role = "customer" | "admin";

export type OrderStatus =
  | "pending"
  | "paid"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "success" | "failed" | "refund_initiated" | "refunded";

