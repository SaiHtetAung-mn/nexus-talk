import { Injectable, Logger } from '@nestjs/common';

import type { Server } from 'socket.io';
import { realtimeRooms, type RealtimeEventName } from './realtime.rooms';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server: Server | null = null;

  attachServer(server: Server) {
    this.server = server;
  }

  emitToUser<T>(userId: string, event: RealtimeEventName, payload: T) {
    this.server?.to(realtimeRooms.user(userId)).emit(event, payload);
  }

  emitToConversation<T>(
    conversationId: string,
    event: RealtimeEventName,
    payload: T,
  ) {
    this.server?.to(realtimeRooms.conversation(conversationId)).emit(
      event,
      payload,
    );
  }

  emitToCall<T>(callId: string, event: RealtimeEventName, payload: T) {
    this.server?.to(realtimeRooms.call(callId)).emit(event, payload);
  }

  assertServer() {
    if (!this.server) {
      this.logger.warn('Realtime server requested before initialization');
    }
  }
}
