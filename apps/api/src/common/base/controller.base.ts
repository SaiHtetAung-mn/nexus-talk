import {
  ApiErrorResponse,
  ApiSuccessResponse,
  PaginationMeta,
} from '@/core/contracts/api-response.contract';

export abstract class BaseController {
  protected success<T>(
    data: T | null,
    message?: string,
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      statusCode: 200,
      message: message ?? null,
      data,
    };
  }

  protected created<T>(message?: string): ApiSuccessResponse<T> {
    return {
      success: true,
      statusCode: 201,
      message: message ?? null,
      data: null,
    };
  }

  protected paginatedSuccess<T>(
    data: T,
    meta: PaginationMeta,
    message?: string,
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      statusCode: 200,
      message: message ?? null,
      data,
      meta,
    };
  }

  protected error(message: string, statusCode: number = 400): ApiErrorResponse {
    return {
      success: false,
      statusCode,
      message: null,
      error: {
        message,
      },
    };
  }
}
