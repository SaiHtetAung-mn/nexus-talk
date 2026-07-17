import { useEffect, useState } from "react";
import { ArrowUpRight, LoaderCircle, PhoneOff, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getRealtimeSocket } from "@/features/workspace/lib/realtime-client";
import { listCalls } from "@/features/workspace/api/list-calls";
import type { CallSession } from "@/features/workspace/api/types";
import { openCallWindow } from "@/features/workspace/lib/open-call-window";

function formatCallMeta(call: CallSession) {
  if (call.status === "ringing") {
    return "Ringing";
  }

  if (call.status === "active") {
    return "In progress";
  }

  return "Ended";
}

export function CallsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCalls() {
      try {
        const items = await listCalls();
        if (active) {
          setCalls(items);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load calls.";
        toast.error(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadCalls();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const socket = getRealtimeSocket();

    async function refreshCalls() {
      try {
        const items = await listCalls();
        setCalls(items);
      } catch {
        // keep existing data on refresh failure
      }
    }

    socket.on("call.invite.created", refreshCalls);
    socket.on("call.updated", refreshCalls);
    socket.on("call.started", refreshCalls);
    socket.on("call.ended", refreshCalls);

    return () => {
      socket.off("call.invite.created", refreshCalls);
      socket.off("call.updated", refreshCalls);
      socket.off("call.started", refreshCalls);
      socket.off("call.ended", refreshCalls);
    };
  }, []);

  function handleOpenCall(callId: string) {
    const popup = openCallWindow(callId);

    if (popup.isPopupBlocked) {
      toast.message("Popup was blocked. Opening call in this tab.");
    }

    popup.focus();
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Calls</h2>
        <p className="text-sm text-muted-foreground">
          Active sessions and recent call history.
        </p>
      </div>

      <div className="rounded-2xl border bg-card">
        {isLoading ? (
          <div className="flex min-h-56 items-center justify-center">
            <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : calls.length ? (
          <div className="divide-y">
            {calls.map((call) => {
              const partner = call.participants.find(
                (participant) => participant._id !== currentUser?._id,
              );

              return (
                <div
                  key={call._id}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <ProfileAvatar
                      name={partner?.name ?? "Call"}
                      email={partner?.email ?? null}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {partner?.name ?? "Video call"}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {formatCallMeta(call)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOpenCall(call._id)}
                    >
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Open call
                    </Button>
                    <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {call.status === "active" ? (
                        <Video className="h-3.5 w-3.5" />
                      ) : call.status === "ringing" ? (
                        <PhoneOff className="h-3.5 w-3.5 rotate-135" />
                      ) : (
                        <PhoneOff className="h-3.5 w-3.5" />
                      )}
                      {call.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Video className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">No calls yet</p>
              <p className="text-sm text-muted-foreground">
                Start a video call from a conversation and it will show up here.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
