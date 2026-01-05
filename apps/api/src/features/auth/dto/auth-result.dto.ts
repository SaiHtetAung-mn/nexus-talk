import { UserResponseDto } from '@/features/user/dto/user-response.dto';

export type TokenPairDto = {
  access_token: string;
  refresh_token: string;
};

export type AuthResultDto = {
  user: UserResponseDto;
  tokens: TokenPairDto;
};
