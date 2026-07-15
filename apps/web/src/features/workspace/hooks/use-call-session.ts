import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getRealtimeSocket } from "@/features/workspace/lib/realtime-client";
import type { CallSession } from "@/features/workspace/api/types";

type UseCallSessionOptions = {
  call: CallSession | null;
  currentUserId: string | undefined;
};

type SignalPayload = {
  callId: string;
  fromUserId: string;
  description?: RTCSessionDescriptionInit | null;
  candidate?: RTCIceCandidateInit | null;
};

const rtcConfiguration: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function useCallSession({
  call,
  currentUserId,
}: UseCallSessionOptions) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const syncVideoElements = useCallback(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, []);

  const startMedia = useCallback(async () => {
    if (localStreamRef.current) {
      syncVideoElements();
      return localStreamRef.current;
    }

    setIsBusy(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      localStreamRef.current = stream;
      setIsMediaReady(true);
      syncVideoElements();
      return stream;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to access camera and microphone.";
      toast.error(message);
      throw error;
    } finally {
      setIsBusy(false);
    }
  }, [syncVideoElements]);

  const flushPendingIceCandidates = useCallback(async (
    peerConnection: RTCPeerConnection,
  ) => {
    if (!peerConnection.remoteDescription) {
      return;
    }

    while (pendingIceCandidatesRef.current.length > 0) {
      const candidate = pendingIceCandidatesRef.current.shift();

      if (!candidate) {
        continue;
      }

      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // Ignore stale candidates from a previous negotiation attempt.
      }
    }
  }, []);

  const ensurePeerConnection = useCallback(async (
    socket: ReturnType<typeof getRealtimeSocket>,
    activeCall: CallSession,
    userId: string,
  ) => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const stream = await startMedia();
    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    const remoteStream = new MediaStream();
    remoteStreamRef.current = remoteStream;
    syncVideoElements();

    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    peerConnection.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        const exists = remoteStream
          .getTracks()
          .some((existingTrack) => existingTrack.id === track.id);

        if (!exists) {
          remoteStream.addTrack(track);
        }
      });
      setRemoteConnected(true);
      syncVideoElements();
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === "failed") {
        toast.error("Unable to establish the video connection.");
      }

      if (
        peerConnection.connectionState === "closed" ||
        peerConnection.connectionState === "disconnected" ||
        peerConnection.connectionState === "failed"
      ) {
        setRemoteConnected(false);
      }
    };

    peerConnection.onicecandidate = (event) => {
      const targetUserId = activeCall.participants.find(
        (participant) => participant._id !== userId,
      )?._id;

      if (!event.candidate || !targetUserId) {
        return;
      }

      socket.emit("call.signal.ice-candidate", {
        callId: activeCall._id,
        targetUserId,
        candidate: event.candidate.toJSON(),
      });
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [startMedia, syncVideoElements]);

  const beginPeerSession = useCallback(async () => {
    if (!call || !currentUserId) {
      return;
    }

    const socket = getRealtimeSocket();
    const targetUserId = call.participants.find(
      (participant) => participant._id !== currentUserId,
    )?._id;

    if (!targetUserId) {
      return;
    }

    const peer = await ensurePeerConnection(socket, call, currentUserId);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("call.signal.offer", {
      callId: call._id,
      targetUserId,
      description: offer,
    });
  }, [call, currentUserId, ensurePeerConnection]);

  const teardown = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    pendingIceCandidatesRef.current = [];
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setRemoteConnected(false);
    setIsMediaReady(false);
  }, []);

  useEffect(() => {
    syncVideoElements();
  }, [isMediaReady, remoteConnected, syncVideoElements]);

  useEffect(() => {
    if (!call?._id || !currentUserId) {
      return;
    }

    const activeCall = call;
    const userId = currentUserId;
    const socket = getRealtimeSocket();
    socket.emit("call.room.join", { callId: activeCall._id });

    async function handleOffer(payload: SignalPayload) {
      if (
        payload.callId !== activeCall._id ||
        payload.fromUserId === userId
      ) {
        return;
      }

      const peer = await ensurePeerConnection(socket, activeCall, userId);
      if (!payload.description) {
        return;
      }

      await peer.setRemoteDescription(
        new RTCSessionDescription(payload.description),
      );
      await flushPendingIceCandidates(peer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("call.signal.answer", {
        callId: activeCall._id,
        targetUserId: payload.fromUserId,
        description: answer,
      });
    }

    async function handleAnswer(payload: SignalPayload) {
      if (
        payload.callId !== activeCall._id ||
        payload.fromUserId === userId
      ) {
        return;
      }

      const peer = peerConnectionRef.current;
      if (!peer || !payload.description) {
        return;
      }

      await peer.setRemoteDescription(
        new RTCSessionDescription(payload.description),
      );
      await flushPendingIceCandidates(peer);
    }

    async function handleIceCandidate(payload: SignalPayload) {
      if (
        payload.callId !== activeCall._id ||
        payload.fromUserId === userId
      ) {
        return;
      }

      if (!payload.candidate) {
        return;
      }

      const peer = peerConnectionRef.current;
      if (!peer || !peer.remoteDescription) {
        pendingIceCandidatesRef.current.push(payload.candidate);
        return;
      }

      try {
        await peer.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch {
        pendingIceCandidatesRef.current.push(payload.candidate);
      }
    }

    function handleCallEnded(payload: { callId: string }) {
      if (payload.callId !== activeCall._id) {
        return;
      }

      toast.message("Call ended");
      teardown();
    }

    socket.on("call.signal.offer", handleOffer);
    socket.on("call.signal.answer", handleAnswer);
    socket.on("call.signal.ice-candidate", handleIceCandidate);
    socket.on("call.ended", handleCallEnded);

    return () => {
      socket.off("call.signal.offer", handleOffer);
      socket.off("call.signal.answer", handleAnswer);
      socket.off("call.signal.ice-candidate", handleIceCandidate);
      socket.off("call.ended", handleCallEnded);
      teardown();
    };
  }, [
    call,
    currentUserId,
    ensurePeerConnection,
    flushPendingIceCandidates,
    teardown,
  ]);

  return {
    localVideoRef,
    remoteVideoRef,
    isMediaReady,
    remoteConnected,
    isBusy,
    startMedia,
    beginPeerSession,
    teardown,
  };
}
