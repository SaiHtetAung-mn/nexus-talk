import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LoaderCircle,
  PhoneIncoming,
  PhoneOff,
} from "lucide-react";
import { toast } from "sonner";

import { resolveSection } from "./navigation";
import { AppRail } from "../components/layouts/app-rail";
import { DashboardHeader } from "../components/layouts/dashboard-header";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { logoutUser } from "@/features/auth/api/logout";
import { acceptVideoCall } from "@/features/workspace/api/accept-video-call";
import { endCall } from "@/features/workspace/api/end-call";
import { disconnectRealtimeSocket, getRealtimeSocket } from "@/features/workspace/lib/realtime-client";
import { openCallWindow } from "@/features/workspace/lib/open-call-window";
import { startRingtone, type RingtoneController } from "@/features/workspace/lib/ringtone";
import type { CallSession } from "@/features/workspace/api/types";

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const activeSection = resolveSection(location.pathname);
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [isHandlingIncoming, setIsHandlingIncoming] = useState(false);
  const ringtoneRef = useRef<RingtoneController | null>(null);

  useEffect(() => {
    if (incomingCall?.status === "ringing") {
      ringtoneRef.current?.stop();
      ringtoneRef.current = startRingtone();
      return;
    }

    ringtoneRef.current?.stop();
    ringtoneRef.current = null;
  }, [incomingCall?.status]);

  useEffect(() => {
    const socket = getRealtimeSocket();

    function handleCallInvite(call: CallSession) {
      if (call.initiatorId === user?._id) {
        return;
      }

      setIncomingCall(call);
    }

    function handleCallUpdated(call: CallSession) {
      setIncomingCall((previous) => {
        if (!previous || previous._id !== call._id) {
          return previous;
        }

        if (call.status !== "ringing") {
          return null;
        }

        return call;
      });
    }

    function handleCallEnded(payload: { callId: string }) {
      setIncomingCall((previous) =>
        previous?._id === payload.callId ? null : previous,
      );
    }

    socket.on("call.invite.created", handleCallInvite);
    socket.on("call.updated", handleCallUpdated);
    socket.on("call.started", handleCallUpdated);
    socket.on("call.ended", handleCallEnded);

    return () => {
      socket.off("call.invite.created", handleCallInvite);
      socket.off("call.updated", handleCallUpdated);
      socket.off("call.started", handleCallUpdated);
      socket.off("call.ended", handleCallEnded);
    };
  }, [user?._id]);

  useEffect(
    () => () => {
      ringtoneRef.current?.stop();
      ringtoneRef.current = null;
    },
    [],
  );

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
  const isChatFullscreen = location.pathname === "/" && Boolean(chatId);

  async function handleAcceptIncomingCall() {
    if (!incomingCall) {
      return;
    }

    const popup = openCallWindow();
    if (popup.isPopupBlocked) {
      toast.message("Popup was blocked. Opening call in this tab.");
    }

    setIsHandlingIncoming(true);
    try {
      const accepted = await acceptVideoCall(incomingCall._id);
      setIncomingCall(null);
      popup.navigateTo(accepted._id);
    } catch (error) {
      popup.close();
      const message =
        error instanceof Error ? error.message : "Unable to accept call.";
      toast.error(message);
    } finally {
      setIsHandlingIncoming(false);
    }
  }

  async function handleDeclineIncomingCall() {
    if (!incomingCall) {
      return;
    }

    setIsHandlingIncoming(true);
    try {
      await endCall(incomingCall._id);
      setIncomingCall(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to decline call.";
      toast.error(message);
    } finally {
      setIsHandlingIncoming(false);
    }
  }

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

      {incomingCall ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/92 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <ProfileAvatar
                name={
                  incomingCall.participants.find(
                    (participant) => participant._id !== user?._id,
                  )?.name ?? "Caller"
                }
                email={
                  incomingCall.participants.find(
                    (participant) => participant._id !== user?._id,
                  )?.email ?? null
                }
                className="mb-5 h-24 w-24 text-3xl"
              />
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Incoming Call
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {incomingCall.participants.find(
                  (participant) => participant._id !== user?._id,
                )?.name ?? "Someone"}
              </h2>
              <div className="mt-6 flex w-full items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => void handleDeclineIncomingCall()}
                  disabled={isHandlingIncoming}
                >
                  <PhoneOff className="mr-2 h-4 w-4" />
                  Decline
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500"
                  onClick={() => void handleAcceptIncomingCall()}
                  disabled={isHandlingIncoming}
                >
                  {isHandlingIncoming ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PhoneIncoming className="mr-2 h-4 w-4" />
                  )}
                  Accept
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
