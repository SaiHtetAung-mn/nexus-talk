import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { AuthGuard, type AuthenticatedRequest } from '@/core/guards/auth.guard';
import { CallService } from './call.service';
import { StartVideoCallDto } from './dto/start-video-call.dto';

@UseGuards(AuthGuard)
@Controller('calls')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.callService.listForUser(req.user?._id ?? '');
  }

  @Get(':callId')
  getOne(
    @Req() req: AuthenticatedRequest,
    @Param('callId') callId: string,
  ) {
    return this.callService.getForUser(callId, req.user?._id ?? '');
  }

  @Post('video')
  startVideo(
    @Req() req: AuthenticatedRequest,
    @Body() body: StartVideoCallDto,
  ) {
    return this.callService.startVideoCall(
      body.conversationId,
      req.user?._id ?? '',
    );
  }

  @Post(':callId/accept')
  accept(
    @Req() req: AuthenticatedRequest,
    @Param('callId') callId: string,
  ) {
    return this.callService.acceptCall(callId, req.user?._id ?? '');
  }

  @Post(':callId/end')
  end(
    @Req() req: AuthenticatedRequest,
    @Param('callId') callId: string,
  ) {
    return this.callService.endCall(callId, req.user?._id ?? '');
  }
}
