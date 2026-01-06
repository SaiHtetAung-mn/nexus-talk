import { http } from "@/lib/http";
import type { MessageResponse } from "@/features/auth/api/types";

export async function resendVerificationEmail(
  email: string,
): Promise<MessageResponse> {
  const response = await http.post<MessageResponse>(
    "/auth/verification/resend",
    { email },
  );

  return response.data;
}
