import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoaderCircle, PhoneIncoming, PhoneOff, Video } from "lucide-react";
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
import { cn } from "@/lib/utils";

function formatCallTime(value: string | null) {
  if (!value) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

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

  const partner = useMemo(
    () =>
      activeCall?.participants.find(
        (participant) => participant._id !== currentUser?._id,
      ) ?? null,
    [activeCall, currentUser?._id],
  );

  const isIncomingRinging =
    activeCall?.status === "ringing" &&
    activeCall.initiatorId !== currentUser?._id;
  const isOutgoingRinging =
    activeCall?.status === "ringing" &&
    activeCall.initiatorId === currentUser?._id;
  const isLiveCall = activeCall?.status === "active";

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

    socket.on("call.updated", handleCallUpdated);
    socket.on("call.started", handleCallUpdated);
    socket.on("call.ended", async (payload: { callId: string }) => {
      offerStartedRef.current = false;
      await refreshCalls();
      if (activeCallId && payload.callId === activeCallId) {
        setActiveCall(null);
        navigate("/calls", { replace: true });
        toast.message("Call ended");
      }
    });

    return () => {
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

    void bootstrapMedia().catch(() => {
      offerStartedRef.current = false;
    });
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
      setActiveCall(null);
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
                  {call.status === "ringing" ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  ) : null}
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

      <section className="overflow-hidden rounded-2xl border bg-card/80">
        {activeCall ? (
          <div className="relative min-h-[540px] bg-slate-950 text-white">
            <div className="absolute inset-0">
              {remoteConnected ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(71,85,105,0.5),_rgba(15,23,42,0.98)_55%)] px-6 text-center">
                  <div className="space-y-4">
                    <ProfileAvatar
                      name={partner?.name ?? "Call"}
                      email={partner?.email ?? null}
                      className="mx-auto h-20 w-20 bg-white/10 text-2xl text-white"
                    />
                    <div className="space-y-1">
                      <p className="text-2xl font-semibold">
                        {partner?.name ?? "Video call"}
                      </p>
                      <p className="text-sm text-white/70">
                        {isIncomingRinging
                          ? "Incoming video call"
                          : isOutgoingRinging
                            ? "Calling..."
                            : isLiveCall
                              ? "Waiting for remote video..."
                              : "Call ended"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
            </div>

            <div className="relative flex min-h-[540px] flex-col justify-between p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/65">
                    Nexus Talk Video
                  </p>
                  <h3 className="text-2xl font-semibold">
                    {partner?.name ?? "Video call"}
                  </h3>
                  <p className="text-sm text-white/70">
                    {isIncomingRinging
                      ? "Ringing now"
                      : isOutgoingRinging
                        ? "Waiting for them to answer"
                        : isLiveCall
                          ? remoteConnected
                            ? "Connected"
                            : "Connecting media..."
                          : "Call ended"}
                    {activeCall.createdAt
                      ? ` • ${formatCallTime(activeCall.createdAt)}`
                      : ""}
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-2xl backdrop-blur sm:w-44">
                  <div className="aspect-[3/4] bg-slate-900">
                    {isMediaReady ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm text-white/75">
                        <Video className="h-5 w-5" />
                        <span>Camera is off</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-white/10 px-3 py-2 text-xs text-white/65">
                    You
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {!isMediaReady ? (
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">Camera and microphone</p>
                        <p className="text-sm text-white/70">
                          Start local media before or during the call.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void startMedia()}
                        disabled={isBusy}
                      >
                        {isBusy ? (
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Video className="mr-2 h-4 w-4" />
                        )}
                        {isBusy ? "Opening camera..." : "Start camera"}
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {isIncomingRinging ? (
                    <Button
                      type="button"
                      size="lg"
                      className="min-w-36 rounded-full bg-emerald-600 px-6 text-white hover:bg-emerald-500"
                      onClick={() => void handleAcceptCall()}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <PhoneIncoming className="mr-2 h-5 w-5" />
                      )}
                      {isUpdating ? "Joining..." : "Accept"}
                    </Button>
                  ) : null}

                  <Button
                    type="button"
                    size="lg"
                    className={cn(
                      "min-w-36 rounded-full px-6 text-white shadow-lg",
                      "bg-rose-600 hover:bg-rose-500",
                    )}
                    onClick={() => void handleEndCall()}
                    disabled={isUpdating}
                  >
                    <PhoneOff className="mr-2 h-5 w-5" />
                    {isIncomingRinging ? "Decline" : "End call"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[540px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_38%),linear-gradient(180deg,_rgba(15,23,42,0.02),_rgba(15,23,42,0.06))] p-8 text-center">
            <div className="max-w-sm space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Video className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-foreground">
                  Ready for a call
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose a recent session or start a video call from any conversation.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
