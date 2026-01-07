import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '@/features/user/users.module';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RefreshTokenGuard } from '../../core/guards/refresh-token.guard';
import { EmailVerification } from '@/database/entities/EmailVerification';
import { EmailVerificationService } from './email-verification.service';
import { MailerModule } from '@/common/service/mail/mail.module';
import { RefreshToken } from '@/database/entities/RefreshToken';
import { RefreshTokenService } from './refresh-token.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    RefreshTokenGuard,
    EmailVerificationService,
    RefreshTokenService,
  ],
  exports: [AuthService, AuthGuard, RefreshTokenGuard],
  imports: [
    UserModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([EmailVerification, RefreshToken]),
    MailerModule,
  ],
})
export class AuthModule {}
