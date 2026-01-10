import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';

import { AccountService } from './account.service';
import { AuthGuard, type AuthenticatedRequest } from '@/core/guards/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SetPasswordDto } from './dto/set-password.dto';

@UseGuards(AuthGuard)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    const userId = req.user?._id;
    return this.accountService.getProfile(userId ?? '');
  }

  @Patch('profile')
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateProfileDto,
  ) {
    const userId = req.user?._id;
    return this.accountService.updateProfile(userId ?? '', body);
  }

  @Patch('password')
  updatePassword(
    @Req() req: AuthenticatedRequest,
    @Body() body: ChangePasswordDto,
  ) {
    const userId = req.user?._id;
    return this.accountService.changePassword(userId ?? '', body);
  }

  @Patch('password/create')
  createPassword(
    @Req() req: AuthenticatedRequest,
    @Body() body: SetPasswordDto,
  ) {
    const userId = req.user?._id;
    return this.accountService.setPassword(userId ?? '', body);
  }
}
