import { http } from "@/lib/http";
import { unwrapApiResponse } from "@/lib/api-response";
import { type LoginValues } from "@/features/auth/schemas/login-schema";
import type { AuthResponse } from "@/features/auth/api/types";

export async function login(payload: LoginValues): Promise<AuthResponse> {
  const response = await http.post("/auth/login", payload);
  return unwrapApiResponse<AuthResponse>(response);
}
