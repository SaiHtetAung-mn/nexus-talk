import { http } from "@/lib/http";
import { setAuthTokens } from "@/lib/auth-tokens";
import { type LoginValues } from "@/features/auth/schemas/login-schema";

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    displayName: string;
    handle: string;
    email: string;
  };
};

export async function login(payload: LoginValues): Promise<LoginResponse> {
  const response = await http.post<LoginResponse>("/auth/login", payload);
  const data = response.data;
  setAuthTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return data;
}
