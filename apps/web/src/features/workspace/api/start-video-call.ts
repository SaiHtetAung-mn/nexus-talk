import { http } from "@/lib/http";
import { unwrapApiResponse } from "@/lib/api-response";
import type { CallSession } from "./types";

export async function startVideoCall(
  conversationId: string,
): Promise<CallSession> {
  const response = await http.post("/calls/video", { conversationId });
  return unwrapApiResponse<CallSession>(response);
}
