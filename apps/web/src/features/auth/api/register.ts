import { http } from "@/lib/http";
import type { RegisterValues } from "@/features/auth/schemas/register-schema";
import type { MessageResponse } from "@/features/auth/api/types";

export async function registerUser(
  payload: RegisterValues,
): Promise<MessageResponse> {
  const response = await http.post<MessageResponse>("/auth/register", {
    name: payload.displayName,
    email: payload.email,
    username: payload.handle,
    password: payload.password,
  });

  return response.data;
}
