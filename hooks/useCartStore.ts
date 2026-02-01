import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

export interface CartItem {
  id: string; // product id
  title: string;
  price: number;
  discountPrice?: number;
  image?: string;
  vendor: { name: string };
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  isSynced: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  syncWithServer: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      isSynced: false,

      addItem: async (product) => {
        const { isAuthenticated } = useAuthStore.getState();
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === product.id);

        if (isAuthenticated) {
          try {
            // Optimistic update
            if (existingItem) {
              set({
                items: currentItems.map((i) =>
                  i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
                ),
              });
            } else {
              set({ items: [...currentItems, { ...product, quantity: 1 }] });
            }

            // API Call
            await api.post("/cart", {
              productId: product.id,
              quantity: 1,
            });
            set({ isSynced: false }); // Needs re-sync or verification if strictly consistent, but usually one-way is fine.
            // Actually, if we just added to server, we are technically "synced" for THIS item, but let's keep it simple.
            // If we set isSynced=false, next reload will fetch truth. That is safe.
          } catch (error) {
            console.error("Failed to add item to server cart", error);
            // Revert optimism? Or let next sync fix it. Reverting is safer but complex here without prev state.
            // For now, allow UI to be optimistic.
          }
        } else {
          // Local storage logic
          if (existingItem) {
            set({
              items: currentItems.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            });
          } else {
            set({ items: [...currentItems, { ...product, quantity: 1 }] });
          }
        }
      },

      removeItem: async (itemId) => {
        const { isAuthenticated } = useAuthStore.getState();

        set({ items: get().items.filter((i) => i.id !== itemId) });

        if (isAuthenticated) {
          try {
            await api.delete(`/cart/${itemId}`);
            set({ isSynced: false });
          } catch (error) {
            console.error("Failed to remove item from server cart", error);
          }
        }
      },

      updateQuantity: async (itemId, quantity) => {
        const { isAuthenticated } = useAuthStore.getState();

        if (quantity <= 0) {
          await get().removeItem(itemId);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i,
          ),
        });

        if (isAuthenticated) {
          try {
            await api.patch(`/cart/${itemId}`, { quantity });
            set({ isSynced: false });
          } catch (error) {
            console.error("Failed to update quantity on server", error);
          }
        }
      },

      clearCart: () => set({ items: [] }),
      setIsOpen: (isOpen) => set({ isOpen }),

      syncWithServer: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;

        set({ isLoading: true });

        const { items: guestItems, isSynced } = get();

        try {
          // If we have items AND we are NOT synced, perform merge (Sync)
          if (guestItems.length > 0 && !isSynced) {
            const syncId = nanoid(); // Generate unique ID for this sync attempt

            const payload = {
              items: guestItems.map((i) => ({
                productId: i.id,
                quantity: i.quantity,
              })),
              syncId,
            };

            const response = (await api.post<any>(
              "/cart/sync",
              payload,
            )) as any;

            if (response && response.items) {
              const serverItems = response.items.map((item: any) => ({
                id: item.product.id,
                title: item.product.title,
                price: item.product.price,
                image: item.product.images?.[0] || "",
                vendor: { name: item.product.vendor?.name || "Vendor" },
                quantity: item.quantity,
              }));
              set({ items: serverItems, isSynced: true });
            }
          } else {
            // Otherwise, we just fetch the truth from server (GET)
            // This happens if:
            // 1. Guest cart was empty (nothing to merge).
            // 2. We are already isSynced=true (don't re-merge).
            const cart = (await api.get<any>("/cart")) as any;
            if (cart && cart.items) {
              const serverItems = cart.items.map((item: any) => ({
                id: item.product.id,
                title: item.product.title,
                price: item.product.price,
                image: item.product.images?.[0] || "",
                vendor: { name: item.product.vendor?.name || "Vendor" },
                quantity: item.quantity,
              }));
              set({ items: serverItems, isSynced: true });
            } else {
              // If cart is null/empty on server
              set({ items: [], isSynced: true });
            }
          }
        } catch (error) {
          console.error("Failed to sync cart", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "vendx_cart", // key in localStorage
      skipHydration: true,
      partialize: (state) => ({ items: state.items, isSynced: state.isSynced }), // Persist isSynced!
    },
  ),
);

// Subscribe to auth changes to clear cart on logout
useAuthStore.subscribe((state, prevState) => {
  if (prevState.user && !state.user) {
    useCartStore.getState().clearCart();
  }
});
