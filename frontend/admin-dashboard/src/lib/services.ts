import { adminApi } from "../api/client";

// ── Types ──

export type AdminProduct = {
  id: string;
  name: string;
  price: number;
  published: boolean;
  slug?: string;
  description?: string;
  unit_label?: string;
};

export type AdminCourse = {
  id: string;
  title: string;
  price: number;
  published: boolean;
  slug?: string;
  description?: string;
  instructor_name?: string;
  duration_hours?: number;
  difficulty?: string;
  thumbnail_url?: string;
  category_tag?: string;
  lessons_count?: number;
};

export type ShippingAddress = {
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  landmark: string | null;
};

export type AdminOrder = {
  id: string;
  user_name: string;
  user_email: string;
  status: string;
  total_amount: number;
  items_count: number;
  created_at: string | null;
  shipping_address: ShippingAddress | null;
  cancellation?: {
    reason: string;
    status: string;
    admin_note: string | null;
  } | null;
};

export type AdminUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string | null;
};

export type Metrics = {
  total_users: number;
  total_orders: number;
  total_revenue: number;
};

// ── API Functions ──

export const adminServices = {
  // Dashboard
  metrics: async () => (await adminApi.get("/admin/metrics")).data as Metrics,

  // Products
  listProducts: async () =>
    (await adminApi.get("/admin/products")).data as AdminProduct[],
  createProduct: async (payload: {
    seller_id: string;
    category_id: string;
    name: string;
    slug: string;
    unit_price: number;
    description?: string;
    unit_label?: string;
  }) => (await adminApi.post("/admin/products", payload)).data,
  updateProduct: async (
    id: string,
    payload: {
      name?: string;
      slug?: string;
      description?: string;
      unit_price?: number;
      unit_label?: string;
      is_published?: boolean;
    }
  ) => (await adminApi.patch(`/admin/products/${id}`, payload)).data,
  deleteProduct: async (id: string) =>
    (await adminApi.delete(`/admin/products/${id}`)).data,

  // Courses
  listCourses: async () =>
    (await adminApi.get("/admin/courses")).data as AdminCourse[],
  createCourse: async (payload: {
    title: string;
    slug: string;
    description?: string;
    instructor_name: string;
    price: number;
    duration_hours?: number;
    difficulty?: string;
    thumbnail_url?: string;
    category_tag?: string;
    lessons_count?: number;
  }) => (await adminApi.post("/admin/courses", payload)).data,
  updateCourse: async (
    id: string,
    payload: {
      title?: string;
      slug?: string;
      description?: string;
      instructor_name?: string;
      price?: number;
      duration_hours?: number;
      difficulty?: string;
      thumbnail_url?: string;
      category_tag?: string;
      lessons_count?: number;
      is_published?: boolean;
    }
  ) => (await adminApi.patch(`/admin/courses/${id}`, payload)).data,
  deleteCourse: async (id: string) =>
    (await adminApi.delete(`/admin/courses/${id}`)).data,

  // Orders
  listAllOrders: async () =>
    (await adminApi.get("/admin/orders")).data as AdminOrder[],
  updateOrderStatus: async (id: string, status: string) =>
    (await adminApi.patch(`/admin/orders/${id}/status`, { status })).data,
  cancelledOrders: async () =>
    (await adminApi.get("/orders/admin/cancelled")).data as Array<{
      order_id: string;
      cancellation_status: string;
      total_amount: number;
    }>,
  reviewCancellation: async (
    orderId: string,
    approve: boolean,
    admin_note?: string
  ) =>
    (
      await adminApi.post(`/orders/admin/${orderId}/cancellation-review`, {
        approve,
        admin_note,
      })
    ).data,

  // Sellers
  createSeller: async (payload: {
    display_name: string;
    contact_email: string;
  }) => (await adminApi.post("/admin/sellers", payload)).data,
  updateSellerStatus: async (
    sellerId: string,
    status: "pending" | "approved" | "rejected" | "blocked"
  ) => (await adminApi.patch(`/admin/sellers/${sellerId}/status`, { status })).data,

  // Users
  listUsers: async () =>
    (await adminApi.get("/admin/users")).data as AdminUser[],
};
