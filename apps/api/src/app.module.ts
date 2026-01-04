import appConfig from '@/config/app.config';
import { envValidationSchema } from '@/config/env.validation';
import databaseConfig from '@/config/database.config';
import { DatabaseModule } from '@/database/database.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import RequestLoggerMiddleware from './core/middlewares/request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      load: [appConfig, databaseConfig],
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
