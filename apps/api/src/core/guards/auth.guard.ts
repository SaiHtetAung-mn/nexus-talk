import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Response, Request } from 'express';

import { AuthService } from '@/features/auth/auth.service';
import { authCookie } from '@/common/constants/auth-cookie.constant';
import type { UserResponseDto } from '@/features/user/dto/user-response.dto';
import { TokenExpiredException } from '@/features/auth/exceptions/token-expired.exception';
import { ApiErrorResponse } from '../contracts/api-response.contract';

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

      const user = await this.authService.getCurrentUser(accessToken);
      request.user = user;

      return true;
    } catch (err) {
      if (err instanceof TokenExpiredException) {
        context.switchToHttp().getResponse<Response>().json({
          success: false,
          error: {
            message: 'Token has expired',
            token_expired: true
          }
        } as ApiErrorResponse)
      }
      return false;
    }
  }
}
