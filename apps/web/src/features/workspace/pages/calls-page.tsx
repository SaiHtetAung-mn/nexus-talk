import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PhoneOff, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { acceptVideoCall } from "@/features/workspace/api/accept-video-call";
import { endCall } from "@/features/workspace/api/end-call";
import { getCall } from "@/features/workspace/api/get-call";
import { listCalls } from "@/features/workspace/api/list-calls";
import type { CallSession } from "@/features/workspace/api/types";
import { getRealtimeSocket } from "@/features/workspace/lib/realtime-client";
import { useCallSession } from "@/features/workspace/hooks/use-call-session";

export function CallsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUser = useAuthStore((state) => state.user);
  const activeCallId = searchParams.get("call");
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const offerStartedRef = useRef(false);
  const {
    localVideoRef,
    remoteVideoRef,
    isMediaReady,
    remoteConnected,
    isBusy,
    startMedia,
    beginPeerSession,
  } = useCallSession({
    call: activeCall,
    currentUserId: currentUser?._id,
  });

  useEffect(() => {
    let active = true;

    async function loadCalls() {
      try {
        const items = await listCalls();
        if (!active) {
          return;
        }
        setCalls(items);
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
    if (!activeCallId) {
      setActiveCall(null);
      offerStartedRef.current = false;
      return;
    }

    const callId = activeCallId;
    let active = true;

    async function loadCall() {
      try {
        const item = await getCall(callId);
        if (!active) {
          return;
        }
        setActiveCall(item);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load call.";
        toast.error(message);
      }
    }

    void loadCall();

    return () => {
      active = false;
    };
  }, [activeCallId]);

  useEffect(() => {
    const socket = getRealtimeSocket();

    async function refreshCalls() {
      try {
        const items = await listCalls();
        setCalls(items);
      } catch {
        // keep current state on refresh failure
      }
    }

    async function handleCallUpdated(call: CallSession) {
      if (activeCallId && call._id === activeCallId) {
        setActiveCall(call);
      }
      await refreshCalls();
    }

    async function handleCallInvite(call: CallSession) {
      const caller = call.participants.find(
        (participant) => participant._id !== currentUser?._id,
      );

      setActiveCall(call);
      navigate(`/calls?call=${encodeURIComponent(call._id)}`);
      toast.message(
        `Incoming video call from ${caller?.name ?? "contact"}`,
      );
      await handleCallUpdated(call);
    }

    socket.on("call.invite.created", handleCallInvite);
    socket.on("call.updated", handleCallUpdated);
    socket.on("call.started", handleCallUpdated);
    socket.on("call.ended", async () => {
      offerStartedRef.current = false;
      await refreshCalls();
      if (activeCallId) {
        try {
          const item = await getCall(activeCallId);
          setActiveCall(item);
        } catch {
          navigate("/calls", { replace: true });
        }
      }
    });

    return () => {
      socket.off("call.invite.created", handleCallInvite);
      socket.off("call.updated", handleCallUpdated);
      socket.off("call.started", handleCallUpdated);
      socket.off("call.ended");
    };
  }, [activeCallId, currentUser?._id, navigate]);

  useEffect(() => {
    async function bootstrapMedia() {
      if (!activeCall || activeCall.status !== "active") {
        offerStartedRef.current = false;
        return;
      }

      await startMedia();

      if (
        activeCall.initiatorId === currentUser?._id &&
        !offerStartedRef.current
      ) {
        offerStartedRef.current = true;
        await beginPeerSession();
      }
    }

    void bootstrapMedia();
  }, [activeCall, beginPeerSession, currentUser?._id, startMedia]);

  async function handleAcceptCall() {
    if (!activeCall) {
      return;
    }

    setIsUpdating(true);
    try {
      const accepted = await acceptVideoCall(activeCall._id);
      setActiveCall(accepted);
      toast.success("Joined video call");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to accept call.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleEndCall() {
    if (!activeCall) {
      return;
    }

    setIsUpdating(true);
    try {
      await endCall(activeCall._id);
      toast.success("Call ended");
      navigate("/calls", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to end call.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
      <section className="rounded-2xl border bg-card/80 p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Calls</h2>
          <p className="text-sm text-muted-foreground">
            Recent and active video sessions.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading calls...</p>
        ) : calls.length ? (
          <div className="space-y-2">
            {calls.map((call) => {
              const partner = call.participants.find(
                (participant) => participant._id !== currentUser?._id,
              );

              return (
                <button
                  key={call._id}
                  type="button"
                  onClick={() => navigate(`/calls?call=${encodeURIComponent(call._id)}`)}
                  className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left hover:bg-muted/60"
                >
                  <ProfileAvatar
                    name={partner?.name ?? "Call"}
                    email={partner?.email ?? null}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">
                      {partner?.name ?? "Video call"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {call.status === "ringing"
                        ? "Ringing"
                        : call.status === "active"
                          ? "Active"
                          : "Ended"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No call history yet. Start from a conversation.
          </p>
        )}
      </section>

      <section className="rounded-2xl border bg-card/80 p-5">
        {activeCall ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {activeCall.participants
                    .filter((participant) => participant._id !== currentUser?._id)
                    .map((participant) => participant.name)
                    .join(", ") || "Video call"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeCall.status === "ringing"
                    ? "Waiting for someone to join"
                    : activeCall.status === "active"
                      ? "Live now"
                      : "Call ended"}
                </p>
              </div>

              <div className="flex gap-2">
                {activeCall.status === "ringing" &&
                activeCall.initiatorId !== currentUser?._id ? (
                  <Button
                    type="button"
                    onClick={() => void handleAcceptCall()}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Joining..." : "Accept"}
                  </Button>
                ) : null}

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => void handleEndCall()}
                  disabled={isUpdating}
                >
                  <PhoneOff className="mr-2 h-4 w-4" />
                  End call
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border bg-slate-950">
                <div className="border-b border-white/10 px-4 py-3 text-sm text-white/80">
                  Your camera
                </div>
                <div className="aspect-video bg-slate-900">
                  {isMediaReady ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-white/60">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void startMedia()}
                        disabled={isBusy}
                      >
                        <Video className="mr-2 h-4 w-4" />
                        {isBusy ? "Opening camera..." : "Start camera"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border bg-slate-950">
                <div className="border-b border-white/10 px-4 py-3 text-sm text-white/80">
                  Remote participant
                </div>
                <div className="aspect-video bg-slate-900">
                  {remoteConnected ? (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-white/60">
                      Waiting for remote video...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[360px] items-center justify-center text-center text-sm text-muted-foreground">
            Choose a call from the list or start a video call from a conversation.
          </div>
        )}
      </section>
    </div>
  );
}
