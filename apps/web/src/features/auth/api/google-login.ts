import { http } from "@/lib/http";
import type { AuthResponse } from "@/features/auth/api/types";

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const response = await http.post<AuthResponse>("/auth/google", { idToken });
  return response.data;
}
