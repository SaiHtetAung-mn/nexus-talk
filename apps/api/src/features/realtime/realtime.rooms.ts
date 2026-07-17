import { type RealtimeServerEventName } from './realtime.events';

export const realtimeRooms = {
  user: (userId: string) => `user:${userId}`,
  conversation: (conversationId: string) =>
    `conversation:${conversationId}`,
  call: (callId: string) => `call:${callId}`,
} as const;

export type RealtimeEventName = RealtimeServerEventName;
