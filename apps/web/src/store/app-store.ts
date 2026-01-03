import { create } from "zustand";

export type AppView = "inbox" | "calls" | "contacts";

type AppState = {
  isSidebarOpen: boolean;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  toggleSidebar: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  activeView: "inbox",
  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),
}));
