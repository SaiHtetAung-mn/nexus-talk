import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { AuthGuard, type AuthenticatedRequest } from '@/core/guards/auth.guard';
import { ConversationService } from './conversation.service';
import { CreateDirectConversationDto } from './dto/create-direct-conversation.dto';

@UseGuards(AuthGuard)
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.conversationService.listForUser(req.user?._id ?? '');
  }

  @Post('direct')
  createDirect(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateDirectConversationDto,
  ) {
    return this.conversationService.createOrGetDirectConversation(
      req.user?._id ?? '',
      body.partnerUserId,
    );
  }

  @Get(':conversationId')
  async getOne(
    @Req() req: AuthenticatedRequest,
    @Param('conversationId') conversationId: string,
  ) {
    const conversation = await this.conversationService.getConversationForMember(
      conversationId,
      req.user?._id ?? '',
    );

    return this.conversationService.mapConversationToResponse(
      conversation,
      req.user?._id ?? '',
    );
  }
}
