import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { User } from '@/database/entities/User';
import { UserService } from '@/features/user/user.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResultDto, TokenPairDto } from './dto/auth-result.dto';
import { TokenExpiredException } from './exceptions/token-expired.exception';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

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

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = this.comparePassword(
      payload.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResult(user);
  }

  async refreshTokens(body: RefreshTokenDto): Promise<AuthResultDto> {
    const payload = this.verifyRefreshJwtToken(body.refreshToken);
    if (!payload?.userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.findUserById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return this.buildAuthResult(user);
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
        throw new TokenExpiredException('Access token has expired');
      }
      throw new UnauthorizedException('Invalid access token');
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
        throw new TokenExpiredException('Refresh token has expired');
      }
      throw new UnauthorizedException('Invalid refresh token');
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
      accessToken: this.signAccessJwtToken(userId),
      refreshToken: this.signRefreshJwtToken(userId),
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
}
