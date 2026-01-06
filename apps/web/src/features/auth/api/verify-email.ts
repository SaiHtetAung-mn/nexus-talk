import { http } from "@/lib/http";
import type { MessageResponse } from "@/features/auth/api/types";

export async function verifyEmailToken(
  token: string,
): Promise<MessageResponse> {
  const response = await http.post<MessageResponse>("/auth/verify-email", {
    token,
  });

  return response.data;
}
