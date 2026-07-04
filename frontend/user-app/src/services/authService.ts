import { apiClient } from "../api/client";

export type LoginPayload = { email: string; password: string };

export const authService = {
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post("/auth/login", payload);
    return data as { access_token: string; refresh_token: string | null };
  },
  signup: async (payload: { email: string; password: string; name: string; phone?: string }) => {
    const { data } = await apiClient.post("/auth/signup", payload);
    return data as { access_token: string; refresh_token: string | null };
  }
};

