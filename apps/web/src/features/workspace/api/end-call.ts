import { http } from "@/lib/http";
import { unwrapMessageResponse } from "@/lib/api-response";

export async function endCall(callId: string): Promise<{ message: string }> {
  const response = await http.post(`/calls/${callId}/end`);
  return unwrapMessageResponse(response);
}
