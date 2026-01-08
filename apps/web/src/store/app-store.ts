import { create } from "zustand";

const initialSidebarState =
  typeof window !== "undefined"
    ? window.matchMedia("(min-width: 768px)").matches
    : true;

type AppState = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: initialSidebarState,
  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),
}));
