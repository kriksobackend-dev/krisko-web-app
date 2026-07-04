import { create } from "zustand";

type AdminAuthState = {
  accessToken: string | null;
  setToken: (token: string) => void;
  logout: () => void;
};

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  accessToken: null,
  setToken: (token) => set({ accessToken: token }),
  logout: () => set({ accessToken: null })
}));

