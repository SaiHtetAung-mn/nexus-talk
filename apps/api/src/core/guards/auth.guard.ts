import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from '@/features/auth/auth.service';
import { authCookie } from '@/common/constants/auth-cookie.constant';
import type { UserResponseDto } from '@/features/user/dto/user-response.dto';
import { TokenExpiredException } from '@/features/auth/exceptions/token-expired.exception';

export type AuthenticatedRequest = Request & {
  user?: UserResponseDto;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    try {
      const cookies =
        (request.cookies as Partial<Record<string, string | undefined>>) ?? {};
      const accessToken = cookies[authCookie.ACCESS_TOKEN_COOKIE] ?? null;

      if (!accessToken) {
        throw new UnauthorizedException({
          message: 'Unauthorized',
          token_expired: true,
        });
      }

      const user = await this.authService.getCurrentUser(accessToken);
      request.user = user;

      return true;
    } catch (error) {
      if (error instanceof TokenExpiredException) {
        throw new UnauthorizedException({
          message: error.message,
          token_expired: true,
        })
      }

      throw error;
    }
  }
}
