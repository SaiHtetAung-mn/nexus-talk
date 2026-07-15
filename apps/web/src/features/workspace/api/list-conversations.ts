import { http } from "@/lib/http";
import { unwrapApiResponse } from "@/lib/api-response";
import type { ConversationPreview } from "./types";

export async function listConversations(): Promise<ConversationPreview[]> {
  const response = await http.get("/conversations");
  return unwrapApiResponse<ConversationPreview[]>(response);
}
