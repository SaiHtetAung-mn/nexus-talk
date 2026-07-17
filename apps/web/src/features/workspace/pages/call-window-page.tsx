import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LoaderCircle,
  Mic,
  MicOff,
  PhoneIncoming,
  PhoneOff,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { acceptVideoCall } from "@/features/workspace/api/accept-video-call";
import { endCall } from "@/features/workspace/api/end-call";
import { getCall } from "@/features/workspace/api/get-call";
import type { CallSession } from "@/features/workspace/api/types";
import { useCallSession } from "@/features/workspace/hooks/use-call-session";
import { getRealtimeSocket } from "@/features/workspace/lib/realtime-client";
import { cn } from "@/lib/utils";

function formatCallLabel(call: CallSession | null, remoteConnected: boolean) {
  if (!call) {
    return "Call unavailable";
  }

  if (call.status === "ringing") {
    return "Waiting for answer";
  }

  if (call.status === "active") {
    return remoteConnected ? "Connected" : "Connecting media";
  }

  return "Call ended";
}

export function CallWindowPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUser = useAuthStore((state) => state.user);
  const callId = searchParams.get("call");
  const [call, setCall] = useState<CallSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const offerStartedRef = useRef(false);
  const {
    localVideoRef,
    remoteVideoRef,
    isMediaReady,
    remoteConnected,
    isBusy,
    isAudioMuted,
    isVideoMuted,
    startMedia,
    beginPeerSession,
    toggleAudioMute,
    toggleVideoMute,
    teardown,
  } = useCallSession({
    call,
    currentUserId: currentUser?._id,
  });

  const partner = useMemo(
    () =>
      call?.participants.find(
        (participant) => participant._id !== currentUser?._id,
      ) ?? null,
    [call, currentUser?._id],
  );

  const isIncomingRinging =
    call?.status === "ringing" && call.initiatorId !== currentUser?._id;
  const isCallEnded = call?.status === "ended";

  useEffect(() => {
    if (!callId) {
      setIsLoading(false);
      setCall(null);
      return;
    }

    const resolvedCallId = callId;
    let active = true;

    async function loadCall() {
      try {
        const item = await getCall(resolvedCallId);
        if (!active) {
          return;
        }
        setCall(item);
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Unable to load call.";
        toast.error(message);
        setCall(null);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadCall();

    return () => {
      active = false;
    };
  }, [callId]);

  useEffect(() => {
    if (call?.status === "ended" || !call) {
      offerStartedRef.current = false;
      teardown();
    }
  }, [call, teardown]);

  useEffect(() => {
    if (!isCallEnded) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.close();
      navigate("/calls", { replace: true });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [isCallEnded, navigate]);

  useEffect(() => {
    const socket = getRealtimeSocket();

    function handleCallUpdated(payload: CallSession) {
      if (!callId || payload._id !== callId) {
        return;
      }

      setCall(payload);
    }

    function handleCallEnded(payload: { callId: string }) {
      if (!callId || payload.callId !== callId) {
        return;
      }

      offerStartedRef.current = false;
      setCall((previous) =>
        previous
          ? {
              ...previous,
              status: "ended",
            }
          : previous,
      );
    }

    socket.on("call.updated", handleCallUpdated);
    socket.on("call.started", handleCallUpdated);
    socket.on("call.ended", handleCallEnded);

    return () => {
      socket.off("call.updated", handleCallUpdated);
      socket.off("call.started", handleCallUpdated);
      socket.off("call.ended", handleCallEnded);
    };
  }, [callId]);

  useEffect(() => {
    async function bootstrapCall() {
      if (!call || call.status !== "active") {
        offerStartedRef.current = false;
        return;
      }

      await startMedia();

      if (
        call.initiatorId === currentUser?._id &&
        !offerStartedRef.current
      ) {
        offerStartedRef.current = true;
        await beginPeerSession();
      }
    }

    void bootstrapCall().catch(() => {
      offerStartedRef.current = false;
    });
  }, [beginPeerSession, call, currentUser?._id, startMedia]);

  async function handleAcceptCall() {
    if (!call) {
      return;
    }

    setIsUpdating(true);
    try {
      const accepted = await acceptVideoCall(call._id);
      setCall(accepted);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to accept call.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleEndCall() {
    if (!call) {
      window.close();
      return;
    }

    if (call.status === "ended") {
      window.close();
      return;
    }

    setIsUpdating(true);
    try {
      await endCall(call._id);
      setCall((previous) =>
        previous
          ? {
              ...previous,
              status: "ended",
            }
          : previous,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to end call.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground">
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : call ? (
        <section className="relative flex min-h-screen flex-1 overflow-hidden bg-black">
          {remoteConnected ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}

          <div className="absolute inset-0 bg-black/35" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/65 to-transparent" />

          {!remoteConnected ? (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="flex flex-col items-center gap-4 text-center text-white">
                <ProfileAvatar
                  name={partner?.name ?? "Video call"}
                  email={partner?.email ?? null}
                  className="h-24 w-24 bg-white/10 text-3xl text-white"
                />
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">
                    {partner?.name ?? "Video call"}
                  </p>
                  <p className="text-sm text-white/72">
                    {isIncomingRinging
                      ? "Incoming video call"
                      : call.status === "ringing"
                        ? "Calling..."
                        : call.status === "active"
                          ? "Connecting..."
                          : "Call ended"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-full bg-black/25 px-4 py-2 text-white backdrop-blur">
                <p className="text-base font-semibold">
                  {partner?.name ?? "Video call"}
                </p>
                <p className="text-xs text-white/72">
                  {formatCallLabel(call, remoteConnected)}
                </p>
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-full bg-black/25 text-white hover:bg-black/40 hover:text-white"
                aria-label="Close window"
                onClick={() => window.close()}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex justify-end">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-2xl backdrop-blur sm:w-40">
                <div className="aspect-[3/4] bg-slate-900/80">
                  {isMediaReady ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className={cn(
                        "h-full w-full object-cover",
                        isVideoMuted && "opacity-30",
                      )}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/75">
                      <Video className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              {!isMediaReady ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full bg-white text-black hover:bg-white/90"
                  onClick={() => void startMedia()}
                  disabled={isBusy}
                >
                  {isBusy ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Video className="mr-2 h-4 w-4" />
                  )}
                  Start camera
                </Button>
              ) : null}

              <div className="flex flex-wrap items-center justify-center gap-3">
                {isIncomingRinging ? (
                  <Button
                    type="button"
                    size="icon"
                    className="h-14 w-14 rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
                    onClick={() => void handleAcceptCall()}
                    disabled={isUpdating}
                    aria-label="Accept call"
                  >
                    {isUpdating ? (
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                    ) : (
                      <PhoneIncoming className="h-5 w-5" />
                    )}
                  </Button>
                ) : null}

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-14 w-14 rounded-full bg-black/35 text-white hover:bg-black/50 hover:text-white disabled:opacity-50"
                  onClick={toggleAudioMute}
                  disabled={!isMediaReady}
                  aria-label={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
                >
                  {isAudioMuted ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-14 w-14 rounded-full bg-black/35 text-white hover:bg-black/50 hover:text-white disabled:opacity-50"
                  onClick={toggleVideoMute}
                  disabled={!isMediaReady}
                  aria-label={isVideoMuted ? "Show video" : "Hide video"}
                >
                  {isVideoMuted ? (
                    <VideoOff className="h-5 w-5" />
                  ) : (
                    <Video className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  type="button"
                  size="icon"
                  className="h-14 w-14 rounded-full bg-rose-600 text-white hover:bg-rose-500"
                  onClick={() => void handleEndCall()}
                  disabled={isUpdating}
                  aria-label="End call"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-lg font-semibold">Call not available</p>
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            Back to workspace
          </Button>
        </div>
      )}
    </main>
  );
}
