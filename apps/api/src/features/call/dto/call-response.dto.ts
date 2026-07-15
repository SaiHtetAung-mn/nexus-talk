import type { UserResponseDto } from '@/features/user/dto/user-response.dto';

export type CallResponseDto = {
  _id: string;
  conversationId: string;
  initiatorId: string;
  participants: UserResponseDto[];
  status: 'ringing' | 'active' | 'ended';
  type: 'video';
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date | null;
};
