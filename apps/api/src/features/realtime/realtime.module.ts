import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/features/auth/auth.module';
import { CallSession } from '@/database/entities/CallSession';
import { Conversation } from '@/database/entities/Conversation';
import { CallRepository } from '@/features/call/call.repository';
import { ConversationRepository } from '@/features/conversation/conversation.repository';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeAccessService } from './realtime-access.service';
import { RealtimeService } from './realtime.service';
import { WsAuthGuard } from './guards/ws-auth.guard';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Conversation, CallSession])],
  providers: [
    RealtimeGateway,
    RealtimeService,
    RealtimeAccessService,
    WsAuthGuard,
    ConversationRepository,
    CallRepository,
  ],
  exports: [RealtimeService],
})
export class RealtimeModule {}
