import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { authCookie } from '@/common/constants/auth-cookie.constant';

export type RefreshTokenRequest = Request & {
  refreshToken?: string | null;
};

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RefreshTokenRequest>();

    const cookies =
      (request.cookies as Partial<Record<string, string | undefined>>) ?? {};
    const refreshToken = cookies[authCookie.REFRESH_TOKEN_COOKIE] ?? null;

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    request.refreshToken = refreshToken;
    return true;
  }
}
