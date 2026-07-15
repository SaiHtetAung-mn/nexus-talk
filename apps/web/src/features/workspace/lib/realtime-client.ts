import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;

let socket: Socket | null = null;

export function getRealtimeSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket"],
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectRealtimeSocket() {
  socket?.disconnect();
}
