import type { UserPayload } from "@/features/auth/api/types";

export type ConversationPreview = {
  _id: string;
  type: "direct" | "group";
  members: UserPayload[];
  title: string;
  subtitle: string | null;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  lastMessageSenderId: string | null;
  updatedAt: string | null;
};

export type WorkspaceMessage = {
  _id: string;
  conversationId: string;
  senderId: string;
  body: string;
  type: "text";
  sequence: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CallSession = {
  _id: string;
  conversationId: string;
  initiatorId: string;
  participants: UserPayload[];
  status: "ringing" | "active" | "ended";
  type: "video";
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string | null;
};
