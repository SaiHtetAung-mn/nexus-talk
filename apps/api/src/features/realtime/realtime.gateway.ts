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
      client.emit('system.ready', {
        userId: user._id,
      });
      this.logger.debug(`Socket connected for user ${user._id}`);
    } catch (error) {
      if (error instanceof TokenExpiredException) {
        client.emit('system.error', {
          message: error.message,
          token_expired: true,
        });
      } else if (error instanceof UnauthorizedException) {
        client.emit('system.error', {
          message: 'Unauthorized',
        });
      }

      client.disconnect();
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('system.ping')
  handlePing() {
    return {
      event: 'system.pong',
      data: {
        ok: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('chat.conversation.join')
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
      event: 'chat.conversation.joined',
      data: { conversationId },
    };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('call.room.join')
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
      event: 'call.room.joined',
      data: { callId },
    };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('chat.typing.start')
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
      'chat.typing.started',
      {
        conversationId,
        userId: user?._id ?? null,
      },
    );
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('chat.typing.stop')
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
      'chat.typing.stopped',
      {
        conversationId,
        userId: user?._id ?? null,
      },
    );
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('call.signal.offer')
  handleOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallSignalPayload,
  ) {
    return this.emitCallSignal(client, 'call.signal.offer', payload);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('call.signal.answer')
  handleAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallSignalPayload,
  ) {
    return this.emitCallSignal(client, 'call.signal.answer', payload);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('call.signal.ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CallSignalPayload,
  ) {
    return this.emitCallSignal(client, 'call.signal.ice-candidate', payload);
  }

  private async emitCallSignal(
    client: AuthenticatedSocket,
    event:
      | 'call.signal.offer'
      | 'call.signal.answer'
      | 'call.signal.ice-candidate',
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
