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

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(200)
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(body);
    this.authService.attachAuthCookies(res, result.tokens);
    return result;
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

  @UseGuards(AuthGuard)
  @Get('me')
  getCurrentUser(@Req() req: AuthenticatedRequest) {
    return { user: req.user };
  }
}
