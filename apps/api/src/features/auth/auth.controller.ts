import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleOAuthDto } from './dto/google-oauth.dto';
import type { Response } from 'express';
import {
  AuthGuard,
  type AuthenticatedRequest,
} from '../../core/guards/auth.guard';
import {
  RefreshTokenGuard,
  type RefreshTokenRequest,
} from '../../core/guards/refresh-token.guard';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { authCookie } from '@/common/constants/auth-cookie.constant';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(200)
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(body);
    this.authService.attachAuthCookies(res, result.tokens);
    return result;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @Req() req: RefreshTokenRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshTokens(req.refreshToken);
    this.authService.attachAuthCookies(res, result.tokens);
    return result;
  }

  @Post('google')
  async loginWithGoogle(
    @Body() body: GoogleOAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginWithGoogle(body);
    this.authService.attachAuthCookies(res, result.tokens);
    return result;
  }

  @Post('verify-email')
  @HttpCode(200)
  verifyEmail(@Body() body: VerifyEmailDto) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('verification/resend')
  @HttpCode(200)
  resendVerification(@Body() body: ResendVerificationDto) {
    return this.authService.resendVerification(body.email);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies =
      (req.cookies as Partial<Record<string, string | undefined>>) ?? {};
    const refreshToken = cookies[authCookie.REFRESH_TOKEN_COOKIE] ?? null;
    await this.authService.invalidateRefreshToken(refreshToken);
    this.authService.clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getCurrentUser(@Req() req: AuthenticatedRequest) {
    return { user: req.user };
  }
}
