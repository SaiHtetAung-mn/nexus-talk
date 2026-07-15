import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Conversation } from '@/database/entities/Conversation';
import { UserModule } from '@/features/user/users.module';
import { ConversationController } from './conversation.controller';
import { ConversationRepository } from './conversation.repository';
import { ConversationService } from './conversation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation]), UserModule],
  controllers: [ConversationController],
  providers: [ConversationRepository, ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
