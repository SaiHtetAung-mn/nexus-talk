export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  statusCode: number;
  fieldErrors?: FieldErrors;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    fieldErrors?: FieldErrors,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
    this.details = details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
