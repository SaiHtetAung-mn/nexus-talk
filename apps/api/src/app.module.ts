import appConfig from '@/config/app.config';
import { envValidationSchema } from '@/config/env.validation';
import databaseConfig from '@/config/database.config';
import { DatabaseModule } from '@/database/database.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import RequestLoggerMiddleware from './core/middlewares/request-logger.middleware';
import authConfig from './config/auth.config';
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/users.module';
import { AccountModule } from './features/account/account.module';
import mailConfig from './config/mail.config';
import { RealtimeModule } from './features/realtime/realtime.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiResponseInterceptor } from './core/interceptors/api-response.interceptor';
import { ConversationModule } from './features/conversation/conversation.module';
import { MessageModule } from './features/message/message.module';
import { CallModule } from './features/call/call.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      load: [appConfig, databaseConfig, authConfig, mailConfig],
    }),
    DatabaseModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const throttlerEnabled =
          configService.get<boolean>('app.throttlerEnabled') ?? true;
        return {
          throttlers: [
            {
              ttl: 1000 * 60,
              limit: 150,
              ignoreUserAgents: throttlerEnabled ? [] : [/.*/],
            },
          ],
        };
      },
    }),

    /** Feature modules import */
    UserModule,
    AccountModule,
    AuthModule,
    RealtimeModule,
    ConversationModule,
    MessageModule,
    CallModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
