import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { resolveSection } from "./navigation";
import { AppRail } from "../components/layouts/app-rail";
import { DashboardHeader } from "../components/layouts/dashboard-header";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { logoutUser } from "@/features/auth/api/logout";

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

  const chatId = new URLSearchParams(location.search).get("chat");
  const isChatFullscreen = location.pathname === "/" && Boolean(chatId);

  return (
    <div className="flex min-h-screen bg-muted/40 text-foreground">
      <AppRail hideMobileNav={isChatFullscreen} />

      <main
        className={
          isChatFullscreen
            ? "flex min-h-screen flex-1 flex-col pb-0"
            : "flex min-h-screen flex-1 flex-col pb-16 md:pb-0"
        }
      >
        {isChatFullscreen ? (
          <div className="hidden md:block">
            <DashboardHeader
              sectionLabel={activeSection?.label}
              currentUser={user}
              onLogout={handleLogout}
              onNavigateProfile={handleNavigateProfile}
            />
          </div>
        ) : (
          <DashboardHeader
            sectionLabel={activeSection?.label}
            currentUser={user}
            onLogout={handleLogout}
            onNavigateProfile={handleNavigateProfile}
          />
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-4 sm:py-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
