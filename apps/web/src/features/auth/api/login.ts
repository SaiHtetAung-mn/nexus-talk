import { http } from "@/lib/http";
import { type LoginValues } from "@/features/auth/schemas/login-schema";
import type { AuthResponse } from "@/features/auth/api/types";

export async function login(payload: LoginValues): Promise<AuthResponse> {
  const response = await http.post<AuthResponse>("/auth/login", payload);
  return response.data;
}
