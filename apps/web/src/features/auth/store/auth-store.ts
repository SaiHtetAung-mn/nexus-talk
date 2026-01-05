import { create } from "zustand";

import type { UserPayload } from "@/features/auth/api/types";

type AuthState = {
  user: UserPayload | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setUser: (user: UserPayload) => void;
  clearUser: () => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  setUser: (user) => set({ user, isAuthenticated: true, isHydrated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false, isHydrated: true }),
  setHydrated: (hydrated) => set({ isHydrated: hydrated }),
}));
