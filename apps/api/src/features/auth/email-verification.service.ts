import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { randomUUID } from 'crypto';

import { EmailVerification } from '@/database/entities/EmailVerification';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(EmailVerification)
    private readonly repository: MongoRepository<EmailVerification>,
  ) {}

  async createToken(
    userId: string | ObjectId,
    ttlMinutes = 60 * 24,
  ): Promise<{ token: string; expiresAt: Date }> {
    const objectId =
      typeof userId === 'string' ? new ObjectId(userId) : userId;

    await this.repository.deleteMany({ user_id: objectId.toString() });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const entity = this.repository.create({
      user_id: objectId.toString(),
      token,
      expired_at: expiresAt,
    });

    await this.repository.save(entity);

    return { token, expiresAt };
  }

  async consumeToken(
    token: string,
  ): Promise<EmailVerification | null> {
    const record = await this.repository.findOne({
      where: { token },
    });

    if (!record) {
      return null;
    }

    if (record.expired_at < new Date()) {
      await this.repository.delete(record._id);
      return null;
    }

    await this.repository.delete(record._id);
    return record;
  }
}
