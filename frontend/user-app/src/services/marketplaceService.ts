import { apiClient } from "../api/client";

export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  unit_price: number;
  unit_label: string;
  avg_rating: number | null;
  image: string | null;
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  unit_price: number;
  unit_label: string;
  avg_rating: number | null;
  is_published: boolean;
  category_id: string | null;
  seller_id: string | null;
  images: Array<{ id: string; image_url: string; sort_order: number }>;
  inventory: { stock_available: number; low_stock_threshold: number } | null;
  reviews: Array<{ rating: number; comment: string | null }>;
};

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export const marketplaceService = {
  listProducts: async (search = "", categoryId?: string, sort = "latest") => {
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (categoryId) params.category_id = categoryId;
    if (sort) params.sort = sort;
    const { data } = await apiClient.get("/marketplace/products", { params });
    return data as ProductSummary[];
  },

  getProduct: async (productId: string) => {
    const { data } = await apiClient.get(`/marketplace/products/${productId}`);
    return data as ProductDetail;
  },

  listCategories: async () => {
    const { data } = await apiClient.get("/marketplace/categories");
    return data as CategoryItem[];
  },
};
