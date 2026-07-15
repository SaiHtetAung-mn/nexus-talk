import { http } from "@/lib/http";
import { unwrapApiResponse } from "@/lib/api-response";
import type { CallSession } from "./types";

export async function listCalls(): Promise<CallSession[]> {
  const response = await http.get("/calls");
  return unwrapApiResponse<CallSession[]>(response);
}
