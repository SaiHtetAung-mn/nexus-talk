import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '../contracts/api-response.contract';

@Catch()
class UnhandleExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger();

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      throw exception;
    }

    const message = 'Internal server error';

    this.logger.error('Unhandled Error', exception);

    host
      .switchToHttp()
      .getResponse<Response>()
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          message,
        },
      } as ApiErrorResponse);
  }
}

export default UnhandleExceptionFilter;
