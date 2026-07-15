import { http } from "@/lib/http";
import { unwrapApiResponse } from "@/lib/api-response";
import type { WorkspaceMessage } from "./types";

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<WorkspaceMessage> {
  const response = await http.post(`/conversations/${conversationId}/messages`, {
    body,
  });

  return unwrapApiResponse<WorkspaceMessage>(response);
}
