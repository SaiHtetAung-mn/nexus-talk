import { UserResponseDto } from '@/features/user/dto/user-response.dto';

export type TokenPairDto = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResultDto = {
  user: UserResponseDto;
  tokens: TokenPairDto;
};
