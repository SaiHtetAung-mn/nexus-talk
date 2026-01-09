import { Module } from '@nestjs/common';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { UserModule } from '@/features/user/users.module';
import { AuthModule } from '@/features/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
