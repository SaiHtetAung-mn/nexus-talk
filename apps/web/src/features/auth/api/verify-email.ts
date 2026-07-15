import { http } from "@/lib/http";
import { unwrapMessageResponse } from "@/lib/api-response";
import type { MessageResponse } from "@/features/auth/api/types";

export async function verifyEmailToken(
  token: string,
): Promise<MessageResponse> {
  const response = await http.post("/auth/verify-email", {
    token,
  });

  return unwrapMessageResponse(response);
}
