export const realtimeRooms = {
  user: (userId: string) => `user:${userId}`,
  conversation: (conversationId: string) =>
    `conversation:${conversationId}`,
  call: (callId: string) => `call:${callId}`,
} as const;

export type RealtimeEventName =
  | 'system.ready'
  | 'system.pong'
  | 'chat.message.created'
  | 'chat.conversation.updated'
  | 'chat.typing.started'
  | 'chat.typing.stopped'
  | 'call.invite.created'
  | 'call.updated'
  | 'call.started'
  | 'call.ended';
