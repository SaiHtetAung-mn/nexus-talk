import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { createHash, randomUUID } from 'crypto';

import { RefreshToken } from '@/database/entities/RefreshToken';

type SessionMetadata = {
  userAgent?: string | null;
  ipAddress?: string | null;
};

type CreateSessionParams = {
  sessionId: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
} & SessionMetadata;

type RotateSessionParams = {
  sessionId: string;
  userId: string;
  currentToken: string;
  nextToken: string;
  expiresAt: Date;
} & SessionMetadata;

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: MongoRepository<RefreshToken>,
  ) {}

  generateSessionId(): string {
    return randomUUID();
  }

  async createSession(params: CreateSessionParams): Promise<void> {
    const entity = this.repository.create({
      user_id: params.userId,
      session_id: params.sessionId,
      token_hash: this.hashToken(params.refreshToken),
      expires_at: params.expiresAt,
      rotated_at: null,
      user_agent: params.userAgent ?? null,
      ip_address: params.ipAddress ?? null,
    });

    await this.repository.save(entity);
  }

  async rotateSession(params: RotateSessionParams): Promise<void> {
    const record = await this.repository.findOne({
      where: { session_id: params.sessionId },
    });

    if (!record || record.user_id !== params.userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (record.expires_at < new Date()) {
      await this.repository.delete(record._id);
      throw new UnauthorizedException({
        message: 'Refresh token has expired',
        token_expired: true,
      });
    }

    const currentHash = this.hashToken(params.currentToken);
    if (record.token_hash !== currentHash) {
      await this.repository.delete(record._id);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    record.token_hash = this.hashToken(params.nextToken);
    record.expires_at = params.expiresAt;
    record.rotated_at = new Date();
    record.user_agent = params.userAgent ?? record.user_agent ?? null;
    record.ip_address = params.ipAddress ?? record.ip_address ?? null;

    await this.repository.save(record);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.repository.deleteMany({ session_id: sessionId });
  }

  async deleteByToken(refreshToken: string): Promise<void> {
    const hash = this.hashToken(refreshToken);
    await this.repository.deleteMany({ token_hash: hash });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
