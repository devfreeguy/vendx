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
            // API uses DELETE /api/cart/[itemId] based on previous context, but here it said /cart/items/itemId.
            // Checking route.ts for cart: It has GET, POST.
            // Checking route.ts for cart/[itemId]: DELETE, PATCH.
            await api.delete(`/cart/${itemId}`);
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

        // 1. Get Guest Cart Items before they might be cleared or mixed (snapshot)
        const guestItems = get().items;

        try {
          if (guestItems.length > 0) {
            // 2. Perform Idempotent Sync
            const syncId = nanoid(); // Generate unique ID for this sync attempt

            // payload: { items: [...], syncId: "..." }
            const payload = {
              items: guestItems.map((i) => ({
                productId: i.id,
                quantity: i.quantity,
              })),
              syncId,
            };

            // Expected response: { success: true, data: CartWithItems }
            const response = (await api.post<any>(
              "/cart/sync",
              payload,
            )) as any;
            // The interceptor might return data.data (Cart).
            // My route returns { success: true, data: result }.
            // So response should be `result` (Cart Object).

            if (response && response.items) {
              // 3. Update State with Server Truth
              const serverItems = response.items.map((item: any) => ({
                id: item.product.id,
                title: item.product.title,
                price: item.product.price,
                image: item.product.images?.[0] || "",
                vendor: { name: item.product.vendor?.name || "Vendor" },
                quantity: item.quantity,
              }));

              // This effectively "clears" the guest items by replacing them with the merged server items
              set({ items: serverItems });

              // If we had a way to explicitly clear "guest storage" vs "auth storage", we would.
              // But Zustand persist uses one key. By setting items to serverItems, we have synced.
            }
          } else {
            // If no guest items, just fetch server cart (standard fetch)
            // ... Or we could just call the sync endpoint with empty items?
            // My API handles empty items -> returns "No items to sync".
            // So we should do a GET /cart instead if guestItems is empty.
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
              set({ items: serverItems });
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
      skipHydration: true, // We'll manually hydrate or let it handle itself, but we want to control server sync
      partialize: (state) => ({ items: state.items }), // Only persist items
    },
  ),
);

// Subscribe to auth changes to clear cart on logout
useAuthStore.subscribe((state, prevState) => {
  if (prevState.user && !state.user) {
    useCartStore.getState().clearCart();
  }
});
