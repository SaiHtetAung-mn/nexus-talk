import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
class RequestLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: (error?: any) => void) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const delay = Date.now() - start;
      this.logger.verbose(
        `${method} ${originalUrl} ${statusCode} - ${delay}ms`,
      );
    });

    next();
  }
}

export default RequestLoggerMiddleware;
