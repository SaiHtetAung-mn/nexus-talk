import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { AuthGuard, type AuthenticatedRequest } from '@/core/guards/auth.guard';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/send-message.dto';

@UseGuards(AuthGuard)
@Controller('conversations/:conversationId/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  list(
    @Req() req: AuthenticatedRequest,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messageService.listMessages(
      conversationId,
      req.user?._id ?? '',
    );
  }

  @Post()
  send(
    @Req() req: AuthenticatedRequest,
    @Param('conversationId') conversationId: string,
    @Body() body: SendMessageDto,
  ) {
    return this.messageService.sendMessage(
      conversationId,
      req.user?._id ?? '',
      body.body,
    );
  }
}
