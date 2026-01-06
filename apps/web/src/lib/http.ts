import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import type { AuthResponse } from "@/features/auth/api/types";
import { ApiError } from "@/lib/api-error";
import { useAuthStore } from "@/features/auth/store/auth-store";

type ApiErrorResponse = {
  success?: boolean;
  statusCode?: number;
  error?: {
    message?: string;
    fieldErrors?: Record<string, string>;
    token_expired?: boolean;
    [key: string]: unknown;
  };
};

type RetriableAxiosConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
const retryQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function enqueueRequest(resolve: (value?: unknown) => void, reject: (reason?: unknown) => void) {
  retryQueue.push({ resolve, reject });
}

function flushQueue(error?: unknown) {
  while (retryQueue.length) {
    const pending = retryQueue.shift();
    if (!pending) continue;
    if (error) {
      pending.reject(error);
    } else {
      pending.resolve(true);
    }
  }
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableAxiosConfig | undefined;
    const status = error.response?.status;
    const apiErrorData = error.response?.data as ApiErrorResponse | undefined;
    const isTokenExpired = apiErrorData?.error?.token_expired ?? false;

    if (status === 401 && isTokenExpired && config && !config._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          enqueueRequest(
            () => {
              config._retry = true;
              resolve(http(config));
            },
            (err) => reject(err ?? error),
          );
        });
      }

      config._retry = true;
      isRefreshing = true;
      try {
        await refreshAccessToken();
        flushQueue();
        return http(config);
      } catch (refreshError) {
        flushQueue(refreshError);
        useAuthStore.getState().clearUser();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (apiErrorData?.error) {
      const statusCode = apiErrorData.statusCode ?? status ?? 500;
      const { message, fieldErrors, ...details } = apiErrorData.error;
      const normalizedMessage =
        typeof message === "string"
          ? message
          : "Something went wrong. Please try again.";

      return Promise.reject(
        new ApiError(
          normalizedMessage,
          statusCode,
          fieldErrors,
          Object.keys(details).length ? details : undefined,
        ),
      );
    }

    return Promise.reject(error);
  },
);

async function refreshAccessToken() {
  await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/refresh`,
    {},
    {
      withCredentials: true,
    },
  );
}
