import { apiClient } from "../api/client";

export type AddressItem = {
  id: string;
  full_name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

export const userService = {
  me: async () =>
    (await apiClient.get("/users/me")).data as { id: string; name: string; email: string; phone: string | null },

  addresses: async () =>
    (await apiClient.get("/users/me/addresses")).data as AddressItem[],

  createAddress: async (payload: {
    full_name: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  }) => (await apiClient.post("/users/me/addresses", payload)).data as AddressItem,
};
