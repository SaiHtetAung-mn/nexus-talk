import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Message } from '@/database/entities/Message';
import { AuthModule } from '@/features/auth/auth.module';
import { ConversationModule } from '@/features/conversation/conversation.module';
import { RealtimeModule } from '@/features/realtime/realtime.module';
import { MessageController } from './message.controller';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    AuthModule,
    ConversationModule,
    RealtimeModule,
  ],
  controllers: [MessageController],
  providers: [MessageRepository, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
