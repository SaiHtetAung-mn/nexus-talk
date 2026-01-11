import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { resolveSection } from "./navigation";
import { AppSidebar } from "../components/layouts/app-sidebar";
import { AppRail } from "../components/layouts/app-rail";
import { DashboardHeader } from "../components/layouts/dashboard-header";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { logoutUser } from "@/features/auth/api/logout";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const activeSection = resolveSection(location.pathname);

  async function handleLogout() {
    try {
      await logoutUser();
    } catch {
      // ignore error; we'll still clear local state
    } finally {
      clearUser();
      toast.success("Signed out");
      navigate("/auth", { replace: true });
    }
  }

  function handleNavigateProfile() {
    navigate("/profile");
  }

  return (
    <div className="flex min-h-screen bg-muted/40 text-foreground">
      <AppRail />

      <main className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">
        <DashboardHeader
          sectionLabel={activeSection?.label}
          currentUser={user}
          onLogout={handleLogout}
          onNavigateProfile={handleNavigateProfile}
        />
        <div className="flex flex-1 flex-col md:flex-row">
          <AppSidebar activeSection={activeSection} variant="desktop" />
          {!location.pathname.startsWith("/profile") && (
            <AppSidebar activeSection={activeSection} variant="mobile" />
          )}
          <div
            className={cn(
              "flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-10",
              !location.pathname.startsWith("/profile") && "hidden md:block",
            )}
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
