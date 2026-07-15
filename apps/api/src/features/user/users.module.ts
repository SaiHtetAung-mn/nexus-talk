import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/features/auth/auth.module';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { User } from '@/database/entities/User';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
