export const realtimeClientEvents = {
  systemPing: "system.ping",
  chatConversationJoin: "chat.conversation.join",
  chatTypingStart: "chat.typing.start",
  chatTypingStop: "chat.typing.stop",
  callRoomJoin: "call.room.join",
  callSignalOffer: "call.signal.offer",
  callSignalAnswer: "call.signal.answer",
  callSignalIceCandidate: "call.signal.ice-candidate",
} as const;

export const realtimeServerEvents = {
  systemReady: "system.ready",
  systemPong: "system.pong",
  systemError: "system.error",
  chatConversationJoined: "chat.conversation.joined",
  chatMessageCreated: "chat.message.created",
  chatConversationUpdated: "chat.conversation.updated",
  chatTypingStarted: "chat.typing.started",
  chatTypingStopped: "chat.typing.stopped",
  callRoomJoined: "call.room.joined",
  callInviteCreated: "call.invite.created",
  callUpdated: "call.updated",
  callStarted: "call.started",
  callEnded: "call.ended",
  callSignalOffer: "call.signal.offer",
  callSignalAnswer: "call.signal.answer",
  callSignalIceCandidate: "call.signal.ice-candidate",
} as const;
