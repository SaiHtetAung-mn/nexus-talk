import { http } from "@/lib/http";
import { unwrapApiResponse } from "@/lib/api-response";
import type { CallSession } from "./types";

export async function acceptVideoCall(callId: string): Promise<CallSession> {
  const response = await http.post(`/calls/${callId}/accept`);
  return unwrapApiResponse<CallSession>(response);
}
