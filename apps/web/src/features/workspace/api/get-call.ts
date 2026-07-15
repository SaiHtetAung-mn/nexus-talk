import { http } from "@/lib/http";
import { unwrapApiResponse } from "@/lib/api-response";
import type { CallSession } from "./types";

export async function getCall(callId: string): Promise<CallSession> {
  const response = await http.get(`/calls/${callId}`);
  return unwrapApiResponse<CallSession>(response);
}
