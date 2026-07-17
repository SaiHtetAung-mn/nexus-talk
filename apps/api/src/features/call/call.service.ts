import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { CallSession } from '@/database/entities/CallSession';
import { ConversationService } from '@/features/conversation/conversation.service';
import { realtimeServerEvents } from '@/features/realtime/realtime.events';
import { RealtimeService } from '@/features/realtime/realtime.service';
import { UserService } from '@/features/user/user.service';
import type { UserResponseDto } from '@/features/user/dto/user-response.dto';
import type { CallResponseDto } from './dto/call-response.dto';
import { CallRepository } from './call.repository';

@Injectable()
export class CallService {
  constructor(
    private readonly callRepository: CallRepository,
    private readonly conversationService: ConversationService,
    private readonly realtimeService: RealtimeService,
    private readonly userService: UserService,
  ) {}

  async listForUser(userId: string): Promise<CallResponseDto[]> {
    const calls = (await this.callRepository
      .aggregate([
        { $match: { participant_ids: userId } },
        { $sort: { created_at: -1 } },
        { $limit: 20 },
      ])
      .toArray()) as CallSession[];

    const responses: CallResponseDto[] = [];
    for (const call of calls) {
      responses.push(await this.toResponse(call));
    }
    return responses;
  }

  async getForUser(callId: string, userId: string): Promise<CallResponseDto> {
    const call = await this.findCallById(callId);
    if (!call || !call.participant_ids.includes(userId)) {
      throw new NotFoundException('Call not found');
    }
    return this.toResponse(call);
  }

  async startVideoCall(
    conversationId: string,
    initiatorId: string,
  ): Promise<CallResponseDto> {
    const conversation = await this.conversationService.getConversationForMember(
      conversationId,
      initiatorId,
    );

    if (conversation.member_ids.length < 2) {
      throw new BadRequestException('Call participants are missing');
    }

    const existing = await this.callRepository.findOne({
      where: {
        conversation_id: conversationId,
        status: 'ringing',
      },
    });

    if (existing) {
      return this.toResponse(existing);
    }

    const entity = this.callRepository.create({
      conversation_id: conversationId,
      initiator_id: initiatorId,
      participant_ids: conversation.member_ids,
      type: 'video',
      status: 'ringing',
      started_at: null,
      ended_at: null,
    });

    const saved = await this.callRepository.save(entity);
    const response = await this.toResponse(saved);

    for (const participantId of conversation.member_ids) {
      this.realtimeService.emitToUser(
        participantId,
        realtimeServerEvents.callInviteCreated,
        response,
      );
    }

    return response;
  }

  async acceptCall(callId: string, userId: string): Promise<CallResponseDto> {
    const call = await this.findCallById(callId);
    if (!call || !call.participant_ids.includes(userId)) {
      throw new NotFoundException('Call not found');
    }

    if (call.status === 'ended') {
      throw new BadRequestException('Call has already ended');
    }

    call.status = 'active';
    call.started_at = call.started_at ?? new Date();
    const saved = await this.callRepository.save(call);
    const response = await this.toResponse(saved);

    this.realtimeService.emitToCall(
      saved._id.toString(),
      realtimeServerEvents.callStarted,
      response,
    );
    for (const participantId of saved.participant_ids) {
      this.realtimeService.emitToUser(
        participantId,
        realtimeServerEvents.callUpdated,
        response,
      );
    }

    return response;
  }

  async endCall(callId: string, userId: string): Promise<{ message: string }> {
    const call = await this.findCallById(callId);
    if (!call || !call.participant_ids.includes(userId)) {
      throw new NotFoundException('Call not found');
    }

    call.status = 'ended';
    call.ended_at = new Date();
    const saved = await this.callRepository.save(call);
    const response = await this.toResponse(saved);

    this.realtimeService.emitToCall(saved._id.toString(), realtimeServerEvents.callEnded, {
      callId: saved._id.toString(),
    });

    for (const participantId of saved.participant_ids) {
      this.realtimeService.emitToUser(
        participantId,
        realtimeServerEvents.callUpdated,
        response,
      );
      this.realtimeService.emitToUser(participantId, realtimeServerEvents.callEnded, {
        callId: saved._id.toString(),
      });
    }

    return { message: 'Call ended' };
  }

  private async toResponse(call: CallSession): Promise<CallResponseDto> {
    const participantUsers = await Promise.all(
      call.participant_ids.map((id) => this.userService.findUserById(id)),
    );

    const participants = participantUsers
      .map((user) => this.userService.toResponse(user))
      .filter((user): user is UserResponseDto => Boolean(user));

    return {
      _id: call._id.toString(),
      conversationId: call.conversation_id,
      initiatorId: call.initiator_id,
      participants,
      status: call.status,
      type: call.type,
      startedAt: (call.started_at as unknown as Date | null) ?? null,
      endedAt: (call.ended_at as unknown as Date | null) ?? null,
      createdAt: (call.created_at as unknown as Date) ?? null,
    };
  }

  private async findCallById(callId: string): Promise<CallSession | null> {
    if (!ObjectId.isValid(callId)) {
      return null;
    }

    return this.callRepository.findOne({
      where: { _id: new ObjectId(callId) },
    });
  }
}
