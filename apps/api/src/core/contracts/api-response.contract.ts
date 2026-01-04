export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string | null;
  data?: T | null;
  meta?: {
    [key: string]: any;
  };
  error?: {
    message: string;
    fieldErrors?: { [field: string]: string[] };
  };
}

export interface ApiSuccessResponse<T = any> extends ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string | null;
  data: T | null;
  meta?: {
    [key: string]: any;
  };
}

export interface ApiErrorResponse extends ApiResponse<null> {
  success: false;
  statusCode: number;
  message: null;
  error: {
    message: string;
    fieldErrors?: { [field: string]: string[] };
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
