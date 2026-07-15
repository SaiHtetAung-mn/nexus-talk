import { http } from "@/lib/http";
import { unwrapMessageResponse } from "@/lib/api-response";
import type { MessageResponse } from "@/features/auth/api/types";

export async function resendVerificationEmail(
  email: string,
): Promise<MessageResponse> {
  const response = await http.post(
    "/auth/verification/resend",
    { email },
  );

  return unwrapMessageResponse(response);
}
