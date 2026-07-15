import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CallSession } from '@/database/entities/CallSession';
import { AuthModule } from '@/features/auth/auth.module';
import { ConversationModule } from '@/features/conversation/conversation.module';
import { RealtimeModule } from '@/features/realtime/realtime.module';
import { UserModule } from '@/features/user/users.module';
import { CallController } from './call.controller';
import { CallRepository } from './call.repository';
import { CallService } from './call.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CallSession]),
    AuthModule,
    ConversationModule,
    RealtimeModule,
    UserModule,
  ],
  controllers: [CallController],
  providers: [CallRepository, CallService],
  exports: [CallService],
})
export class CallModule {}
