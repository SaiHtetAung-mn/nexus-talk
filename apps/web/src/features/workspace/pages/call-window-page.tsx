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
      toast.message("Call ended");
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
      toast.success("Call ended");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to end call.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Nexus Talk Call
          </p>
          <h1 className="text-lg font-semibold">
            {partner?.name ?? "Video call"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close window"
            onClick={() => window.close()}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-muted/30 p-4">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : call ? (
          <div className="flex flex-1 flex-col gap-4">
            <div className="grid flex-1 gap-4 lg:grid-cols-[1fr,320px]">
              <section className="relative overflow-hidden rounded-2xl border bg-card">
                <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4">
                  <div>
                    <h2 className="text-xl font-semibold text-card-foreground">
                      {partner?.name ?? "Video call"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {formatCallLabel(call, remoteConnected)}
                    </p>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
                  {remoteConnected ? (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-center">
                      <ProfileAvatar
                        name={partner?.name ?? "Video call"}
                        email={partner?.email ?? null}
                        className="h-24 w-24 text-3xl"
                      />
                      <div className="space-y-1">
                        <p className="text-xl font-semibold">
                          {partner?.name ?? "Video call"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isIncomingRinging
                            ? "Incoming call"
                            : call.status === "ringing"
                              ? "Calling..."
                              : call.status === "active"
                                ? "Waiting for remote video..."
                                : "Call ended"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <aside className="flex flex-col gap-4">
                <section className="overflow-hidden rounded-2xl border bg-card">
                  <div className="aspect-[4/5] bg-muted">
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
                      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground">
                        <Video className="h-5 w-5" />
                        <p>Start your camera to join the call.</p>
                      </div>
                    )}
                  </div>
                  <div className="border-t px-4 py-3">
                    <p className="font-medium">{currentUser?.name ?? "You"}</p>
                    <p className="text-sm text-muted-foreground">
                      {isAudioMuted
                        ? "Microphone muted"
                        : isVideoMuted
                          ? "Camera off"
                          : isMediaReady
                            ? "Ready"
                            : "Media off"}
                    </p>
                  </div>
                </section>

                <section className="rounded-2xl border bg-card p-4">
                  <p className="mb-3 font-medium">Controls</p>
                  <div className="grid gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void startMedia()}
                      disabled={isBusy}
                    >
                      {isBusy ? (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Video className="mr-2 h-4 w-4" />
                      )}
                      {isMediaReady ? "Refresh media" : "Start camera"}
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={toggleAudioMute}
                        disabled={!isMediaReady}
                      >
                        {isAudioMuted ? (
                          <MicOff className="mr-2 h-4 w-4" />
                        ) : (
                          <Mic className="mr-2 h-4 w-4" />
                        )}
                        {isAudioMuted ? "Unmute" : "Mute"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={toggleVideoMute}
                        disabled={!isMediaReady}
                      >
                        {isVideoMuted ? (
                          <VideoOff className="mr-2 h-4 w-4" />
                        ) : (
                          <Video className="mr-2 h-4 w-4" />
                        )}
                        {isVideoMuted ? "Show video" : "Hide video"}
                      </Button>
                    </div>

                    {isIncomingRinging ? (
                      <Button
                        type="button"
                        className="bg-emerald-600 text-white hover:bg-emerald-500"
                        onClick={() => void handleAcceptCall()}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <PhoneIncoming className="mr-2 h-4 w-4" />
                        )}
                        {isUpdating ? "Joining..." : "Accept call"}
                      </Button>
                    ) : null}

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => void handleEndCall()}
                      disabled={isUpdating}
                    >
                      <PhoneOff className="mr-2 h-4 w-4" />
                      {call.status === "ended" ? "Close call" : "End call"}
                    </Button>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-lg font-semibold">Call not available</p>
            <p className="text-sm text-muted-foreground">
              This call may have ended or the session could not be loaded.
            </p>
            <Button type="button" variant="outline" onClick={() => navigate("/")}>
              Back to workspace
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
