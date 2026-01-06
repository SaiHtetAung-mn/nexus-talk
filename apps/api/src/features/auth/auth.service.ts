import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

import { User } from '@/database/entities/User';
import { UserService } from '@/features/user/user.service';
import { UserResponseDto } from '@/features/user/dto/user-response.dto';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResultDto, TokenPairDto } from './dto/auth-result.dto';
import { GoogleOAuthDto } from './dto/google-oauth.dto';
import type { CookieOptions, Response } from 'express';
import { authCookie } from '@/common/constants/auth-cookie.constant';
import { TokenExpiredException } from './exceptions/token-expired.exception';
type JwtPayload = {
  userId: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client | null;
  private readonly googleAudience: string | null;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    const clientId = this.configService.get<string>('auth.googleOAuthClientId');
    this.googleClient = clientId ? new OAuth2Client(clientId) : null;
    this.googleAudience = clientId ?? null;
  }

  async register(payload: RegisterDto): Promise<AuthResultDto> {
    const email = payload.email.toLowerCase().trim();
    const username = payload.username.trim();

    const existingEmailUser = await this.userService.findUserByEmail(email);
    if (existingEmailUser) {
      throw new BadRequestException('Email already registered');
    }

    const existingUsernameUser =
      await this.userService.findUserByUsername(username);
    if (existingUsernameUser) {
      throw new BadRequestException('Username already taken');
    }

    const user = await this.userService.createUser({
      name: payload.name.trim(),
      email,
      username,
      password: this.hashPassword(payload.password),
      provider: 'local',
      is_email_verified: false,
    });

    return this.buildAuthResult(user);
  }

  async login(payload: LoginDto): Promise<AuthResultDto> {
    const email = payload.email.toLowerCase().trim();
    const user = await this.userService.findUserByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException('Email is not registered');
    }

    const isValidPassword = this.comparePassword(
      payload.password,
      user.password!,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResult(user);
  }

  async refreshTokens(refreshToken?: string | null): Promise<AuthResultDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = this.verifyRefreshJwtToken(refreshToken);
    if (!payload?.userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.findUserById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return this.buildAuthResult(user);
  }

  attachAuthCookies(res: Response, tokens: TokenPairDto) {
    const accessOptions = this.getCookieOptions(
      '/',
      this.getAccessTokenTtlMinutes(),
    );
    const refreshOptions = this.getCookieOptions(
      '/auth/refresh',
      this.getRefreshTokenTtlMinutes(),
    );

    res.cookie(
      authCookie.ACCESS_TOKEN_COOKIE,
      tokens.access_token,
      accessOptions,
    );
    res.cookie(
      authCookie.REFRESH_TOKEN_COOKIE,
      tokens.refresh_token,
      refreshOptions,
    );
  }

  clearAuthCookies(res: Response) {
    const baseAccess = this.getCookieOptions(
      '/',
      this.getAccessTokenTtlMinutes(),
    );
    const baseRefresh = this.getCookieOptions(
      '/auth/refresh',
      this.getRefreshTokenTtlMinutes(),
    );

    res.cookie(authCookie.ACCESS_TOKEN_COOKIE, '', {
      ...baseAccess,
      maxAge: 0,
    });
    res.cookie(authCookie.REFRESH_TOKEN_COOKIE, '', {
      ...baseRefresh,
      maxAge: 0,
    });
  }

  async loginWithGoogle(dto: GoogleOAuthDto): Promise<AuthResultDto> {
    const client = this.getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken: dto.idToken,
      audience: this.googleAudience ?? undefined,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new UnauthorizedException('Invalid Google credential');
    }

    const email = payload.email?.toLowerCase();
    const providerId = payload.sub;
    if (!email || !providerId) {
      throw new UnauthorizedException('Invalid Google credential');
    }

    let user = await this.userService.findUserByProviderAccount(
      'google',
      providerId,
    );

    if (!user) {
      const existingEmailUser = await this.userService.findUserByEmail(email);

      if (existingEmailUser) {
        existingEmailUser.provider = 'google';
        existingEmailUser.provider_id = providerId;
        existingEmailUser.is_email_verified =
          payload.email_verified ?? existingEmailUser.is_email_verified;
        if (!existingEmailUser.name && payload.name) {
          existingEmailUser.name = payload.name;
        }

        user = await this.userService.saveUser(existingEmailUser);
      }
    }

    if (!user) {
      const usernameSeed =
        payload.given_name ??
        payload.family_name ??
        email.split('@')[0] ??
        'user';
      const username = await this.generateUniqueUsername(usernameSeed);

      user = await this.userService.createUser({
        name: payload.name ?? usernameSeed,
        email,
        username,
        provider: 'google',
        provider_id: providerId,
        is_email_verified: payload.email_verified ?? true,
        password: null,
      });
    }

    return this.buildAuthResult(user);
  }

  async getCurrentUser(accessToken?: string | null): Promise<UserResponseDto> {
    if (!accessToken) {
      throw new UnauthorizedException({
        message: 'Access token is missing',
      });
    }

    const payload = this.verifyAccessJwtToken(accessToken);
    if (!payload?.userId) {
      throw new UnauthorizedException({
        message: 'Invalid access token',
      });
    }

    const user = await this.userService.findUserById(payload.userId);
    if (!user) {
      throw new UnauthorizedException({
        message: 'User no longer exists',
      });
    }

    const safeUser = this.userService.toResponse(user);
    if (!safeUser) {
      throw new UnauthorizedException({
        message: 'Unable to load user profile',
      });
    }

    return safeUser;
  }

  verifyAccessJwtToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('auth.accessJwtSecret'),
      });
    } catch (error) {
      if (
        error instanceof TokenExpiredError &&
        error.message === 'jwt expired'
      ) {
        throw new TokenExpiredException();
      }
      throw new UnauthorizedException({
        message: 'Unauthorized',
      });
    }
  }

  verifyRefreshJwtToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('auth.refreshJwtSecret'),
      });
    } catch (error) {
      if (
        error instanceof TokenExpiredError &&
        error.message === 'jwt expired'
      ) {
        throw new TokenExpiredException();
      }
      throw new UnauthorizedException({
        message: 'Unauthorized',
      });
    }
  }

  private buildAuthResult(user: User): AuthResultDto {
    const tokens = this.buildTokenPair(user._id?.toString() ?? '');
    const safeUser = this.userService.toResponse(user);

    return {
      user: safeUser!,
      tokens,
    };
  }

  private buildTokenPair(userId: string): TokenPairDto {
    return {
      access_token: this.signAccessJwtToken(userId),
      refresh_token: this.signRefreshJwtToken(userId),
    };
  }

  private signAccessJwtToken(userId: string): string {
    const payload: JwtPayload = { userId };
    const ttl =
      this.configService.get<number>('auth.accessJwtExpiresInMinute') ?? 15;

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('auth.accessJwtSecret'),
      expiresIn: `${ttl}m`,
    });
  }

  private signRefreshJwtToken(userId: string): string {
    const payload: JwtPayload = { userId };
    const ttl =
      this.configService.get<number>('auth.refreshJwtExpiresInMinute') ?? 60;

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('auth.refreshJwtSecret'),
      expiresIn: `${ttl}m`,
    });
  }

  private hashPassword(password: string): string {
    return bcrypt.hashSync(String(password.trim()), 10);
  }

  private comparePassword(
    plainPassword: string,
    hashPassword: string,
  ): boolean {
    return bcrypt.compareSync(plainPassword, hashPassword);
  }

  private async generateUniqueUsername(seed: string): Promise<string> {
    const normalized = seed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .replace(/^-+|-+$/g, '');
    const base = normalized.length > 1 ? normalized : 'nexususer';
    let candidate = base;
    let suffix = 0;

    while (await this.userService.findUserByUsername(candidate)) {
      suffix += 1;
      candidate = `${base}${suffix}`;
    }

    return candidate;
  }

  private getCookieOptions(path: string, ttlMinutes: number): CookieOptions {
    const secure = this.isProduction();
    const sameSite: CookieOptions['sameSite'] = secure ? 'none' : 'lax';

    return {
      httpOnly: true,
      secure,
      sameSite,
      path,
      maxAge: ttlMinutes * 60 * 1000,
    };
  }

  private getAccessTokenTtlMinutes(): number {
    return 60;
  }

  private getRefreshTokenTtlMinutes(): number {
    return (
      this.configService.get<number>('auth.refreshJwtExpiresInMinute') ??
      60 * 24
    );
  }

  private isProduction(): boolean {
    return (
      (this.configService.get<string>('app.env') ?? 'development') ===
      'production'
    );
  }

  private getGoogleClient(): OAuth2Client {
    if (!this.googleClient || !this.googleAudience) {
      throw new BadRequestException('Google OAuth is not configured');
    }

    return this.googleClient;
  }
}
