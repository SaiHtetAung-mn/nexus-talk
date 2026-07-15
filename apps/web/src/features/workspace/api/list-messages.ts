import { http } from "@/lib/http";
import { unwrapApiResponse } from "@/lib/api-response";
import type { WorkspaceMessage } from "./types";

export async function listMessages(
  conversationId: string,
): Promise<WorkspaceMessage[]> {
  const response = await http.get(`/conversations/${conversationId}/messages`);
  return unwrapApiResponse<WorkspaceMessage[]>(response);
}
