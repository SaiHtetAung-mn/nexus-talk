import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

import { AuthGuard, type AuthenticatedRequest } from '@/core/guards/auth.guard';
import { DiscoverUsersDto } from './dto/discover-users.dto';
import { UserService } from './user.service';

@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('discover')
  discover(
    @Req() req: AuthenticatedRequest,
    @Query() query: DiscoverUsersDto,
  ) {
    return this.userService.discoverUsers(req.user?._id ?? '', query.q);
  }
}
