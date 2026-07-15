import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { Conversation } from '@/database/entities/Conversation';
import { UserService } from '@/features/user/user.service';
import type { UserResponseDto } from '@/features/user/dto/user-response.dto';
import type { ConversationResponseDto } from './dto/conversation-response.dto';
import { ConversationRepository } from './conversation.repository';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly userService: UserService,
  ) {}

  async listForUser(userId: string): Promise<ConversationResponseDto[]> {
    const conversations = await this.findConversationsForUser(userId);
    return this.mapConversationsToResponse(conversations, userId);
  }

  async createOrGetDirectConversation(
    currentUserId: string,
    partnerUserId: string,
  ): Promise<ConversationResponseDto> {
    if (!ObjectId.isValid(currentUserId)) {
      throw new BadRequestException('Invalid current user');
    }

    if (!ObjectId.isValid(partnerUserId)) {
      throw new BadRequestException('partnerUserId is invalid');
    }

    if (currentUserId === partnerUserId) {
      throw new BadRequestException('You cannot start a conversation with yourself');
    }

    const partner = await this.userService.findUserById(partnerUserId);
    if (!partner) {
      throw new NotFoundException('Partner user not found');
    }

    const directKey = this.buildDirectKey([currentUserId, partnerUserId]);
    let conversation = await this.conversationRepository.findOne({
      where: { direct_key: directKey },
    });

    if (!conversation) {
      const created = this.conversationRepository.create({
        type: 'direct',
        member_ids: [currentUserId, partnerUserId],
        member_count: 2,
        direct_key: directKey,
        next_message_sequence: 0,
        last_message_id: null,
        last_message_sender_id: null,
        last_message_text: null,
        last_message_at: null,
      });

      conversation = await this.conversationRepository.save(created);
    }

    return this.mapConversationToResponse(conversation, currentUserId);
  }

  async getConversationForMember(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    if (!ObjectId.isValid(conversationId)) {
      throw new NotFoundException('Conversation not found');
    }

    const conversation = await this.conversationRepository.findOne({
      where: {
        _id: new ObjectId(conversationId),
      },
    });

    if (!conversation || !conversation.member_ids.includes(userId)) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  private async findConversationsForUser(userId: string): Promise<Conversation[]> {
    const conversations = (await this.conversationRepository
      .aggregate([
        { $match: { member_ids: userId } },
        { $sort: { updated_at: -1, last_message_at: -1, created_at: -1 } },
      ])
      .toArray()) as Conversation[];

    return conversations;
  }

  private async mapConversationsToResponse(
    conversations: Conversation[],
    currentUserId: string,
  ): Promise<ConversationResponseDto[]> {
    const responses: ConversationResponseDto[] = [];

    for (const conversation of conversations) {
      responses.push(
        await this.mapConversationToResponse(conversation, currentUserId),
      );
    }

    return responses;
  }

  async mapConversationToResponse(
    conversation: Conversation,
    currentUserId: string,
  ): Promise<ConversationResponseDto> {
    const memberUsers = await Promise.all(
      conversation.member_ids.map((memberId) => this.userService.findUserById(memberId)),
    );

    const members = memberUsers
      .map((member) => this.userService.toResponse(member))
      .filter((member): member is UserResponseDto => Boolean(member));

    const others = members.filter((member) => member._id !== currentUserId);

    return {
      _id: conversation._id.toString(),
      type: conversation.type,
      members,
      title:
        conversation.type === 'direct'
          ? others[0]?.name ?? 'Direct message'
          : `Group (${conversation.member_count})`,
      subtitle:
        conversation.type === 'direct'
          ? others[0]?.username ?? null
          : `${conversation.member_count} members`,
      lastMessageText: conversation.last_message_text ?? null,
      lastMessageAt:
        (conversation.last_message_at as unknown as Date | null) ?? null,
      lastMessageSenderId: conversation.last_message_sender_id ?? null,
      updatedAt: (conversation.updated_at as unknown as Date) ?? null,
    };
  }

  private buildDirectKey(memberIds: string[]): string {
    return [...memberIds].sort().join(':');
  }
}
