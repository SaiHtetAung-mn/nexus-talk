import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '@/features/user/users.module';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RefreshTokenGuard } from '../../core/guards/refresh-token.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, RefreshTokenGuard],
  exports: [AuthService, AuthGuard, RefreshTokenGuard],
  imports: [UserModule, JwtModule.register({})],
})
export class AuthModule {}
