import { Outlet, useLocation } from "react-router-dom";

import { useAppStore } from "@/store";
import { resolveSection } from "./navigation";
import { AppSidebar } from "../components/layouts/app-sidebar";
import { DashboardHeader } from "../components/layouts/dashboard-header";

export function DashboardLayout() {
  const { isSidebarOpen, toggleSidebar } = useAppStore();
  const location = useLocation();
  const activeSection = resolveSection(location.pathname);

  return (
    <div className="flex min-h-screen bg-muted/40 text-foreground">
      <AppSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      <main className="flex flex-1 flex-col">
        <DashboardHeader
          sectionLabel={activeSection?.label}
          onToggleSidebar={toggleSidebar}
        />
        <div className="flex-1 overflow-y-auto px-6 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
