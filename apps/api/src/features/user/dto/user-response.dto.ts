export type UserResponseDto = {
  _id: string;
  name: string;
  email: string;
  username: string;
  provider: 'local' | 'google';
  providerId: string | null;
  isEmailVerified: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
};
