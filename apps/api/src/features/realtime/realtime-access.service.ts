import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { CallRepository } from '@/features/call/call.repository';
import { ConversationRepository } from '@/features/conversation/conversation.repository';

@Injectable()
export class RealtimeAccessService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly callRepository: CallRepository,
  ) {}

  async assertConversationMember(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    if (!ObjectId.isValid(conversationId)) {
      throw new NotFoundException('Conversation not found');
    }

    const conversation = await this.conversationRepository.findOne({
      where: {
        _id: new ObjectId(conversationId),
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.member_ids.includes(userId)) {
      throw new ForbiddenException('You do not have access to this conversation');
    }
  }

  async assertCallParticipant(callId: string, userId: string): Promise<void> {
    if (!ObjectId.isValid(callId)) {
      throw new NotFoundException('Call not found');
    }

    const call = await this.callRepository.findOne({
      where: {
        _id: new ObjectId(callId),
      },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (!call.participant_ids.includes(userId)) {
      throw new ForbiddenException('You do not have access to this call');
    }
  }

  async assertCallSignalAccess(
    callId: string,
    senderUserId: string,
    targetUserId: string,
  ): Promise<void> {
    if (!ObjectId.isValid(callId)) {
      throw new NotFoundException('Call not found');
    }

    const call = await this.callRepository.findOne({
      where: {
        _id: new ObjectId(callId),
      },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (!call.participant_ids.includes(senderUserId)) {
      throw new ForbiddenException('You do not have access to this call');
    }

    if (!call.participant_ids.includes(targetUserId)) {
      throw new ForbiddenException('Target user does not belong to this call');
    }

    if (senderUserId === targetUserId) {
      throw new ForbiddenException('Cannot signal yourself');
    }
  }
}
