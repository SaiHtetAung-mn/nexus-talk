import { http } from "@/lib/http";
import { unwrapApiResponse } from "@/lib/api-response";
import type { AuthResponse } from "@/features/auth/api/types";

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const response = await http.post("/auth/google", { idToken });
  return unwrapApiResponse<AuthResponse>(response);
}
