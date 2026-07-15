import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Conversation } from '@/database/entities/Conversation';
import { AuthModule } from '@/features/auth/auth.module';
import { UserModule } from '@/features/user/users.module';
import { ConversationController } from './conversation.controller';
import { ConversationRepository } from './conversation.repository';
import { ConversationService } from './conversation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation]), UserModule, AuthModule],
  controllers: [ConversationController],
  providers: [ConversationRepository, ConversationService],
  exports: [ConversationRepository, ConversationService],
})
export class ConversationModule {}
