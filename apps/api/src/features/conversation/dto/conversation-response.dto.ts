import type { UserResponseDto } from '@/features/user/dto/user-response.dto';

export type ConversationResponseDto = {
  _id: string;
  type: 'direct' | 'group';
  members: UserResponseDto[];
  title: string;
  subtitle: string | null;
  lastMessageText: string | null;
  lastMessageAt: Date | null;
  lastMessageSenderId: string | null;
  updatedAt: Date | null;
};
