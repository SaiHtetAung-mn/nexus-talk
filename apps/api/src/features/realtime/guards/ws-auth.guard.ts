import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { authCookie } from '@/common/constants/auth-cookie.constant';
import { AuthService } from '@/features/auth/auth.service';
import { TokenExpiredException } from '@/features/auth/exceptions/token-expired.exception';
import type { AuthenticatedSocket } from '../types/authenticated-socket.type';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client =
      context.switchToWs().getClient<AuthenticatedSocket | undefined>();

    if (!client) {
      throw new UnauthorizedException('Socket client is not available');
    }

    try {
      const cookies = parseCookieHeader(client.handshake.headers.cookie);
      const accessToken = cookies[authCookie.ACCESS_TOKEN_COOKIE] ?? null;

      if (!accessToken) {
        throw new UnauthorizedException({
          message: 'Unauthorized',
          token_expired: true,
        });
      }

      const user = await this.authService.getCurrentUser(accessToken);
      client.data.user = user;

      return true;
    } catch (error) {
      if (error instanceof TokenExpiredException) {
        throw new UnauthorizedException({
          message: error.message,
          token_expired: true,
        });
      }

      throw error;
    }
  }
}

function parseCookieHeader(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex < 0) {
        return accumulator;
      }

      const key = part.slice(0, separatorIndex).trim();
      const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());

      if (key) {
        accumulator[key] = value;
      }

      return accumulator;
    }, {});
}
