import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { Message } from '@/database/entities/Message';
import { ConversationRepository } from '@/features/conversation/conversation.repository';
import { RealtimeService } from '@/features/realtime/realtime.service';
import { ConversationService } from '@/features/conversation/conversation.service';
import type { MessageResponseDto } from './dto/message-response.dto';
import { MessageRepository } from './message.repository';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly conversationService: ConversationService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async listMessages(
    conversationId: string,
    userId: string,
  ): Promise<MessageResponseDto[]> {
    await this.conversationService.getConversationForMember(conversationId, userId);

    const messages = (await this.messageRepository
      .aggregate([
        { $match: { conversation_id: conversationId } },
        { $sort: { sequence: 1 } },
        { $limit: 100 },
      ])
      .toArray()) as Message[];

    return messages.map((message) => this.toResponse(message));
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    body: string,
  ): Promise<MessageResponseDto> {
    const normalizedBody = body.trim();
    const conversation = await this.conversationService.getConversationForMember(
      conversationId,
      senderId,
    );

    const updatedConversation = (await this.conversationRepository.findOneAndUpdate(
      {
        _id: new ObjectId(conversationId),
        member_ids: senderId,
      },
      {
        $inc: { next_message_sequence: 1 },
        $set: { updated_at: new Date() },
      } as any,
      {
        returnDocument: 'after',
      },
    )) as { next_message_sequence?: number } | null;
    const sequence = updatedConversation?.next_message_sequence ?? 1;

    const entity = this.messageRepository.create({
      conversation_id: conversationId,
      sender_id: senderId,
      body: normalizedBody,
      type: 'text',
      sequence,
    });

    const saved = await this.messageRepository.save(entity);

    await this.conversationRepository.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: {
          last_message_id: saved._id.toString(),
          last_message_sender_id: senderId,
          last_message_text: normalizedBody,
          last_message_at: new Date(),
          updated_at: new Date(),
        },
      } as any,
    );

    const payload = this.toResponse(saved);
    this.realtimeService.emitToConversation(
      conversationId,
      'chat.message.created',
      payload,
    );

    for (const memberId of conversation.member_ids) {
      this.realtimeService.emitToUser(memberId, 'chat.message.created', payload);
      this.realtimeService.emitToUser(memberId, 'chat.conversation.updated', {
        conversationId,
      });
    }

    return payload;
  }

  private toResponse(message: Message): MessageResponseDto {
    return {
      _id: message._id.toString(),
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      body: message.body,
      type: message.type,
      sequence: message.sequence,
      createdAt: (message.created_at as unknown as Date) ?? null,
      updatedAt: (message.updated_at as unknown as Date) ?? null,
    };
  }
}
