import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string | null;
  unitLabel: string;
  type?: "product" | "course";
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const existing = state.items.find((x) => x.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((x) =>
                x.productId === item.productId ? { ...x, qty: x.qty + item.qty } : x
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((x) => x.productId !== productId) })),
      updateQty: (productId, qty) =>
        set((state) => ({
          items: state.items.map((x) =>
            x.productId === productId ? { ...x, qty: Math.max(1, qty) } : x
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "krikso-cart" }
  )
);

/* Derived selectors */
export const selectTotalItems = (state: CartState) =>
  state.items.reduce((acc, item) => acc + item.qty, 0);

export const selectTotalPrice = (state: CartState) =>
  state.items.reduce((acc, item) => acc + item.price * item.qty, 0);
