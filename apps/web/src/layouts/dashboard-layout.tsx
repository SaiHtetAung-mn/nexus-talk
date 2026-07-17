import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { resolveSection } from "./navigation";
import { AppRail } from "../components/layouts/app-rail";
import { DashboardHeader } from "../components/layouts/dashboard-header";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { logoutUser } from "@/features/auth/api/logout";
import { disconnectRealtimeSocket, getRealtimeSocket } from "@/features/workspace/lib/realtime-client";
import type { CallSession } from "@/features/workspace/api/types";

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const activeSection = resolveSection(location.pathname);

  useEffect(() => {
    const socket = getRealtimeSocket();

    function handleCallInvite(call: CallSession) {
      const caller =
        call.participants.find((participant) => participant._id !== user?._id)
          ?.name ?? "Someone";

      navigate(`/calls?call=${encodeURIComponent(call._id)}`);
      toast.message(`${caller} is calling you`);
    }

    socket.on("call.invite.created", handleCallInvite);

    return () => {
      socket.off("call.invite.created", handleCallInvite);
    };
  }, [navigate, user?._id]);

  async function handleLogout() {
    try {
      await logoutUser();
    } catch {
      // ignore error; we'll still clear local state
    } finally {
      disconnectRealtimeSocket();
      clearUser();
      toast.success("Signed out");
      navigate("/auth", { replace: true });
    }
  }

  function handleNavigateProfile() {
    navigate("/profile");
  }

  const chatId = new URLSearchParams(location.search).get("chat");
  const callId = new URLSearchParams(location.search).get("call");
  const isChatFullscreen = location.pathname === "/" && Boolean(chatId);
  const isCallFullscreen = location.pathname === "/calls" && Boolean(callId);
  const isFullscreenSurface = isChatFullscreen || isCallFullscreen;

  return (
    <div className="flex min-h-screen bg-muted/40 text-foreground">
      <AppRail hideMobileNav={isFullscreenSurface} />

      <main
        className={
          isFullscreenSurface
            ? "flex min-h-screen flex-1 flex-col pb-0"
            : "flex min-h-screen flex-1 flex-col pb-16 md:pb-0"
        }
      >
        {isFullscreenSurface ? (
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

        <div
          className={
            isCallFullscreen
              ? "flex-1 overflow-hidden px-0 py-0"
              : "flex-1 overflow-y-auto px-4 py-4 sm:px-4 sm:py-4"
          }
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
