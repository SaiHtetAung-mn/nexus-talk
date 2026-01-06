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

export type AuthenticatedRequest = Request & {
  user?: UserResponseDto;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    try {
      const cookies =
        (request.cookies as Partial<Record<string, string | undefined>>) ?? {};
      const accessToken = cookies[authCookie.ACCESS_TOKEN_COOKIE] ?? null;

      if (!accessToken) {
        throw new UnauthorizedException({
          message: 'Unauthorized',
        });
      }

      const user = await this.authService.getCurrentUser(accessToken);
      request.user = user;

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException &&
        typeof error.getResponse === 'function'
      ) {
        const response = error.getResponse();
        const message =
          typeof response === 'object' && response !== null
            ? (response as { message?: string }).message
            : undefined;
        const tokenExpired =
          typeof response === 'object' &&
          response !== null &&
          (response as { token_expired?: boolean }).token_expired === true;

        throw new UnauthorizedException({
          message: message ?? 'Unauthorized',
          token_expired: tokenExpired,
        });
      }

      throw error;
    }
  }
}
