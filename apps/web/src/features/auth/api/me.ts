import { http } from "@/lib/http";
import { unwrapApiResponse } from "@/lib/api-response";
import type { UserPayload } from "@/features/auth/api/types";

export async function getCurrentUser(): Promise<UserPayload> {
  const response = await http.get("/auth/me");
  return unwrapApiResponse<UserPayload>(response);
}
