import { create } from "zustand";

type AppState = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),
}));
