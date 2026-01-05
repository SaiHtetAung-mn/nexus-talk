import { http } from "@/lib/http";
import type { RegisterValues } from "@/features/auth/schemas/register-schema";
import type { AuthResponse } from "@/features/auth/api/types";

export async function registerUser(
  payload: RegisterValues,
): Promise<AuthResponse> {
  const response = await http.post<AuthResponse>("/auth/register", {
    name: payload.displayName,
    email: payload.email,
    username: payload.handle,
    password: payload.password,
  });

  return response.data;
}
