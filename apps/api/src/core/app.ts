import {
  ValidationPipe,
  type INestApplication,
  type Type,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import HttpExceptionFilter from './filters/http-exception.filter';
import UnhandleExceptionFilter from './filters/unhandle-exception.filter';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

export class App {
  private constructor(private readonly app: INestApplication) {}

  static async create<T extends Type>(appModule: T): Promise<App> {
    const nestApp = await NestFactory.create(appModule);
    const app = new App(nestApp);
    app.config();

    return app;
  }

  private config() {
    const config = this.app.get(ConfigService);
    this.app.use(
      helmet({
        crossOriginOpenerPolicy: {
          policy: 'same-origin-allow-popups',
        },
      }),
    );
    this.app.use(cookieParser());
    this.app.enableCors({
      origin: config.get<Array<string>>('app.allowOrigins'),
      credentials: true,
    });
    this.app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    this.app.useGlobalFilters(
      new UnhandleExceptionFilter(),
      new HttpExceptionFilter(),
    );
  }

  getInstance() {
    return this.app;
  }

  async start(port: number | string) {
    const resolvedPort = typeof port === 'string' ? parseInt(port, 10) : port;
    await this.app.listen(resolvedPort || 3000);
  }

  async close() {
    return await this.app.close();
  }
}
