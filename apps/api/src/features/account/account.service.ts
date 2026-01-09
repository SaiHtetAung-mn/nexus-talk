import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { UserService } from '@/features/user/user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { UserResponseDto } from '@/features/user/dto/user-response.dto';

@Injectable()
export class AccountService {
  constructor(private readonly userService: UserService) {}

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const safeUser = this.userService.toResponse(user);
    if (!safeUser) {
      throw new NotFoundException('Unable to load profile');
    }
    return safeUser;
  }

  async updateProfile(
    userId: string,
    payload: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const trimmedName = payload.name.trim();
    const normalizedUsername = payload.username.trim();
    const existingUsernameUser =
      await this.userService.findUserByUsername(normalizedUsername);

    if (
      existingUsernameUser &&
      existingUsernameUser._id?.toString() !== userId
    ) {
      throw new BadRequestException('Username already taken');
    }

    user.name = trimmedName;
    user.username = normalizedUsername;

    const updated = await this.userService.saveUser(user);
    return this.userService.toResponse(updated)!;
  }

  async changePassword(
    userId: string,
    payload: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userService.findUserByIdWithPassword(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.provider !== 'local' || !user.password) {
      throw new BadRequestException(
        'Password cannot be updated for social accounts.',
      );
    }

    const matches = bcrypt.compareSync(payload.currentPassword, user.password);
    if (!matches) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = bcrypt.hashSync(payload.newPassword.trim(), 10);
    await this.userService.saveUser(user);
    return { message: 'Password updated successfully' };
  }
}
