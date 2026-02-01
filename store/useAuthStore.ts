import api, { ApiError } from "@/lib/axios";
import { create } from "zustand";

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  profilePicture?: string;
  onboardingCompleted: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  updateProfile: (name: string, profilePicture?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const user = await api.get<User>("/auth/me");
      // api.get returns response.data directly due to interceptor
      // If the response is the user object, use it.
      if (user) {
        set({ user: user as any, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      // 1. Login
      await api.post("/auth/login", { email, password });

      // 2. Best-effort cart sync
      if (typeof window !== "undefined") {
        const localCart = localStorage.getItem("vendx_cart");

        if (localCart) {
          try {
            await api.post("/cart/sync", {
              items: JSON.parse(localCart),
              syncId: crypto.randomUUID(),
            });
            localStorage.removeItem("vendx_cart");
          } catch (err) {
            console.error("Cart sync failed", err);
          }
        }
      }

      // 3. Fetch user
      await get().fetchUser();

      // 4. Success cleanup
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError("Login failed. Please try again.");
    }
  },

  register: async (email, password, role) => {
    set({ isLoading: true });
    try {
      await api.post("/auth/register", { email, password, role });
      // Auto-login after register
      await get().login(email, password);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateProfile: async (name: string, profilePicture?: string) => {
    set({ isLoading: true });
    try {
      const updatedUser = await api.put("/auth/profile", {
        name,
        profilePicture,
      });
      set({ user: updatedUser as any, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
