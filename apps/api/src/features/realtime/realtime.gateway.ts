import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  BadRequestException,
  Logger,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import type { Server } from 'socket.io';
import { authCookie } from '@/common/constants/auth-cookie.constant';
import { AuthService } from '@/features/auth/auth.service';
import { TokenExpiredException } from '@/features/auth/exceptions/token-expired.exception';
import { RealtimeAccessService } from './realtime-access.service';
import {
  realtimeClientEvents,
  realtimeServerEvents,
} from './realtime.events';
import { RealtimeService } from './realtime.service';
import { realtimeRooms } from './realtime.rooms';
import { WsAuthGuard } from './guards/ws-auth.guard';
import type { AuthenticatedSocket } from './types/authenticated-socket.type';

type JoinConversationPayload = {
  conversationId: string;
};

type CallRoomPayload = {
  callId: string;
};

type TypingPayload = {
  conversationId: string;
};

type CallSignalPayload = {
  callId: string;
  targetUserId: string;
  description?: Record<string, unknown>;
  candidate?: Record<string, unknown>;
};

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly authService: AuthService,
    private readonly realtimeAccessService: RealtimeAccessService,
  ) {}

  afterInit(server: Server) {
    this.realtimeService.attachServer(server);
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const cookies = parseCookieHeader(client.handshake.headers.cookie);
      const accessToken = cookies[authCookie.ACCESS_TOKEN_COOKIE] ?? null;
      const user = await this.authService.getCurrentUser(accessToken);

      client.data.user = user;
      client.join(realtimeRooms.user(user._id));
      client.emit(realtimeServerEvents.systemReady, {
        userId: user._id,
      });
      this.logger.debug(`Socket connected for user ${user._id}`);
    } catch (error) {
      if (error instanceof TokenExpiredException) {
        client.emit(realtimeServerEvents.systemError, {
          message: error.message,
          token_expired: true,
        });
      } else if (error instanceof UnauthorizedException) {
        client.emit(realtimeServerEvents.systemError, {
          message: 'Unauthorized',
        });
      }

      client.disconnect();
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(realtimeClientEvents.systemPing)
  handlePing() {
    return {
      event: realtimeServerEvents.systemPong,
      data: {
        ok: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(realtimeClientEvents.chatConversationJoin)
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinConversationPayload,
  ) {
    const conversationId = payload?.conversationId?.trim();
    const userId = client.data.user?._id ?? '';
    if (!conversationId) {
      throw new BadRequestException('conversationId is required');
    }

    await this.realtimeAccessService.assertConversationMember(
      conversationId,
      userId,
    );
    await client.join(realtimeRooms.conversation(conversationId));

    return {
      event: realtimeServerEvents.chatConversationJoined,
      data: { conversationId },
    };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(realtimeClientEvents.callRoomJoin)
  async handleJoinCallRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallRoomPayload,
  ) {
    const callId = payload?.callId?.trim();
    const userId = client.data.user?._id ?? '';
    if (!callId) {
      throw new BadRequestException('callId is required');
    }

    await this.realtimeAccessService.assertCallParticipant(callId, userId);
    await client.join(realtimeRooms.call(callId));

    return {
      event: realtimeServerEvents.callRoomJoined,
      data: { callId },
    };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(realtimeClientEvents.chatTypingStart)
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: TypingPayload,
  ) {
    const conversationId = payload?.conversationId?.trim();
    const user = client.data.user;

    if (!conversationId) {
      throw new BadRequestException('conversationId is required');
    }

    client.to(realtimeRooms.conversation(conversationId)).emit(
      realtimeServerEvents.chatTypingStarted,
      {
        conversationId,
        userId: user?._id ?? null,
      },
    );
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(realtimeClientEvents.chatTypingStop)
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: TypingPayload,
  ) {
    const conversationId = payload?.conversationId?.trim();
    const user = client.data.user;

    if (!conversationId) {
      throw new BadRequestException('conversationId is required');
    }

    client.to(realtimeRooms.conversation(conversationId)).emit(
      realtimeServerEvents.chatTypingStopped,
      {
        conversationId,
        userId: user?._id ?? null,
      },
    );
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(realtimeClientEvents.callSignalOffer)
  handleOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallSignalPayload,
  ) {
    return this.emitCallSignal(
      client,
      realtimeServerEvents.callSignalOffer,
      payload,
    );
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(realtimeClientEvents.callSignalAnswer)
  handleAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallSignalPayload,
  ) {
    return this.emitCallSignal(
      client,
      realtimeServerEvents.callSignalAnswer,
      payload,
    );
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(realtimeClientEvents.callSignalIceCandidate)
  handleIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallSignalPayload,
  ) {
    return this.emitCallSignal(
      client,
      realtimeServerEvents.callSignalIceCandidate,
      payload,
    );
  }

  private async emitCallSignal(
    client: AuthenticatedSocket,
    event:
      | typeof realtimeServerEvents.callSignalOffer
      | typeof realtimeServerEvents.callSignalAnswer
      | typeof realtimeServerEvents.callSignalIceCandidate,
    payload: CallSignalPayload,
  ) {
    const callId = payload?.callId?.trim();
    const targetUserId = payload?.targetUserId?.trim();
    const sender = client.data.user;

    if (!callId) {
      throw new BadRequestException('callId is required');
    }

    if (!targetUserId) {
      throw new BadRequestException('targetUserId is required');
    }

    if (!sender?._id) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.realtimeAccessService.assertCallSignalAccess(
      callId,
      sender._id,
      targetUserId,
    );

    this.realtimeService.emitToUser(targetUserId, event as any, {
      callId,
      fromUserId: sender._id,
      description: payload.description ?? null,
      candidate: payload.candidate ?? null,
    });
  }
}

function parseCookieHeader(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex < 0) {
        return accumulator;
      }

      const key = part.slice(0, separatorIndex).trim();
      const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());

      if (key) {
        accumulator[key] = value;
      }

      return accumulator;
    }, {});
}
