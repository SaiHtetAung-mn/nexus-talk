import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

export class App {
  private constructor(private readonly app: INestApplication) {}

  static async create(): Promise<App> {
    const nestApp = await NestFactory.create(AppModule);
    const app = new App(nestApp);
    app.config();

    return app;
  }

  private config() {
    this.app.use(helmet());
  }

  async start(port: number | string) {
    const resolvedPort = typeof port === 'string' ? parseInt(port, 10) : port;
    await this.app.listen(resolvedPort || 3000);
  }

  async close() {
    return await this.app.close();
  }
}
