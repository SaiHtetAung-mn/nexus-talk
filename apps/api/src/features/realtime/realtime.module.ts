import { Module } from '@nestjs/common';

import { AuthModule } from '@/features/auth/auth.module';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { WsAuthGuard } from './guards/ws-auth.guard';

@Module({
  imports: [AuthModule],
  providers: [RealtimeGateway, RealtimeService, WsAuthGuard],
  exports: [RealtimeService],
})
export class RealtimeModule {}
