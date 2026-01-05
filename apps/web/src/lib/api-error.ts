export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  statusCode: number;
  fieldErrors?: FieldErrors;

  constructor(message: string, statusCode: number, fieldErrors?: FieldErrors) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
