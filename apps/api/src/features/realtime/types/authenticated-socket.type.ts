import type { UserResponseDto } from '@/features/user/dto/user-response.dto';
import type { Socket } from 'socket.io';

export type AuthenticatedSocket = Socket & {
  data: Socket['data'] & {
    user?: UserResponseDto;
  };
};
