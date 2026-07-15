import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, type Observable } from 'rxjs';

import type {
  ApiResponse,
  ApiSuccessResponse,
} from '@/core/contracts/api-response.contract';
import { RESPONSE_MESSAGE_METADATA_KEY } from '@/core/decorators/response-message.decorator';

type MessageOnlyPayload = {
  message: string;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isApiResponse(value: unknown): value is ApiResponse {
  return (
    isPlainObject(value) &&
    typeof value.success === 'boolean' &&
    typeof value.statusCode === 'number'
  );
}

function isMessageOnlyPayload(value: unknown): value is MessageOnlyPayload {
  return (
    isPlainObject(value) &&
    Object.keys(value).length === 1 &&
    typeof value.message === 'string'
  );
}

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T | null>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T | null>> {
    if (context.getType() !== 'http') {
      return next.handle() as Observable<ApiSuccessResponse<T | null>>;
    }

    const response = context.switchToHttp().getResponse();
    const responseMessage = this.reflector.getAllAndOverride<string>(
      RESPONSE_MESSAGE_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    return next.handle().pipe(
      map((payload) => {
        if (isApiResponse(payload)) {
          return payload as ApiSuccessResponse<T | null>;
        }

        const statusCode =
          typeof response?.statusCode === 'number' ? response.statusCode : 200;

        let message = responseMessage ?? null;
        let data = (payload ?? null) as T | null;

        if (isMessageOnlyPayload(payload)) {
          message = responseMessage ?? payload.message;
          data = null;
        }

        return {
          success: true,
          statusCode,
          message,
          data,
        };
      }),
    );
  }
}
