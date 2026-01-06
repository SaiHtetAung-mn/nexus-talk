import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '@/core/contracts/api-response.contract';

@Catch(HttpException)
class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const statusCode = exception.getStatus();
    const rawResponse = exception.getResponse();

    let message = exception.message;
    let fieldErrors: Record<string, string> | undefined;
    let tokenExpired = false;
    const extraDetails: Record<string, unknown> = {};

    if (
      rawResponse &&
      typeof rawResponse === 'object' &&
      !Array.isArray(rawResponse)
    ) {
      const payload = rawResponse as Record<string, unknown>;
      const processedKeys = new Set(['message', 'fieldErrors', 'token_expired', 'tokenExpired']);
      if (typeof payload.message === 'string') {
        message = payload.message;
      } else if (Array.isArray(payload.message)) {
        message = payload.message.join(', ');
      }

      const responseFieldErrors = payload['fieldErrors'];
      if (
        responseFieldErrors &&
        typeof responseFieldErrors === 'object' &&
        !Array.isArray(responseFieldErrors)
      ) {
        fieldErrors = Object.entries(
          responseFieldErrors as Record<string, unknown>,
        ).reduce<Record<string, string>>((acc, [key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            acc[key] = String(value[0]);
          } else if (typeof value === 'string') {
            acc[key] = value;
          }
          return acc;
        }, {});
      }

      const tokenFlag = payload['token_expired'] ?? payload['tokenExpired'];
      if (typeof tokenFlag === 'boolean') {
        tokenExpired = tokenFlag;
      }

      Object.entries(payload).forEach(([key, value]) => {
        if (!processedKeys.has(key)) {
          extraDetails[key] = value;
        }
      });
    }

    const response: ApiErrorResponse = {
      success: false,
      statusCode,
      message: null,
      error: {
        message,
        fieldErrors,
        token_expired: tokenExpired || undefined,
        ...extraDetails,
      },
    };

    host
      .switchToHttp()
      .getResponse<Response>()
      .status(statusCode)
      .json(response);
  }
}

export default HttpExceptionFilter;
