import { apiClient } from "../api/client";

export type OrderSummary = {
  order_id: string;
  order_status: "pending" | "paid" | "packed" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  payment_status: string | null;
  shipment_status: string | null;
  refund_status: string | null;
  created_at: string;
};

export type CancelledOrder = {
  order_id: string;
  order_status: string;
  cancellation_status: string;
  cancellation_reason: string;
  total_amount: number;
  created_at: string;
};

export type CreateOrderPayload = {
  address_id: string;
  payment_method: "cod" | "razorpay";
  items: Array<{ product_id: string; quantity: number }>;
  notes?: string;
};

export type CreateOrderResponse = {
  order_id: string;
  status: string;
  total_amount: number;
  payment_method: string;
};

export const orderService = {
  createOrder: async (payload: CreateOrderPayload) => {
    const { data } = await apiClient.post("/orders", payload);
    return data as CreateOrderResponse;
  },

  myOrders: async () => {
    const { data } = await apiClient.get("/orders/my");
    return data as OrderSummary[];
  },

  cancelledOrders: async () => {
    const { data } = await apiClient.get("/orders/cancelled");
    return data as CancelledOrder[];
  },

  cancelOrder: async (orderId: string, reason: string) => {
    const { data } = await apiClient.post(`/orders/${orderId}/cancel`, { reason });
    return data;
  },
};
