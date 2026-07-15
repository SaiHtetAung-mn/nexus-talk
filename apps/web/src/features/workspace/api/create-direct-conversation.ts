import { http } from "@/lib/http";
import { unwrapApiResponse } from "@/lib/api-response";
import type { ConversationPreview } from "./types";

export async function createDirectConversation(
  partnerUserId: string,
): Promise<ConversationPreview> {
  const response = await http.post("/conversations/direct", { partnerUserId });
  return unwrapApiResponse<ConversationPreview>(response);
}
