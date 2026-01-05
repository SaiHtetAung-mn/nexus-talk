import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from '@/database/entities/User';
import { ObjectId } from 'mongodb';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUserById(id: string | ObjectId): Promise<User | null> {
    if (ObjectId.isValid(id) === false) {
      return null;
    }

    return this.userRepository.findOne({ where: { _id: new ObjectId(id) } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findUserByProviderAccount(
    provider: User['provider'],
    providerId: string,
  ): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        provider,
        provider_id: providerId,
      },
    });
  }

  async findUserByEmailWithPassword(email: string): Promise<User | null> {
    const users = (await this.userRepository
      .aggregate([
        { $match: { email } },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            username: 1,
            provider: 1,
            provider_id: 1,
            is_email_verified: 1,
            created_at: 1,
            updated_at: 1,
            password: 1,
          },
        },
      ])
      .toArray()) as User[];

    return users.length > 0 ? users[0] : null;
  }

  async createUser(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  toResponse(user: User | null): UserResponseDto | null {
    if (!user) {
      return null;
    }

    const { password, ...rest } = user as User & { password?: string };
    void password;

    return {
      _id: user._id?.toString() ?? '',
      name: rest.name,
      email: rest.email,
      username: rest.username,
      provider: rest.provider,
      providerId: rest.provider_id ?? null,
      isEmailVerified: rest.is_email_verified ?? false,
      createdAt: (rest.created_at as unknown as Date) ?? null,
      updatedAt: (rest.updated_at as unknown as Date) ?? null,
    };
  }
}
