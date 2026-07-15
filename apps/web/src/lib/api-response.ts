import type { AxiosResponse } from "axios";

export type ApiSuccessEnvelope<T> = {
  success: true;
  statusCode: number;
  message: string | null;
  data: T | null;
  meta?: Record<string, unknown>;
};

export function unwrapApiResponse<T>(
  response: AxiosResponse<ApiSuccessEnvelope<T>>,
): T {
  if (response.data.data === null) {
    throw new Error("API response data is null");
  }

  return response.data.data;
}

export function unwrapMessageResponse(
  response: AxiosResponse<ApiSuccessEnvelope<null>>,
) {
  return {
    message: response.data.message ?? "",
  };
}
