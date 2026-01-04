import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "./auth-tokens";
import type { LoginResponse } from "@/features/auth/api/login";

type RetriableAxiosConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

    if (status === 401 && config && !config._retry) {
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
        clearAuthTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Session expired. Please sign in again.");
  }

  const response = await axios.post<LoginResponse>(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
    {
      withCredentials: true,
    },
  );

  setAuthTokens({
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  });
}
