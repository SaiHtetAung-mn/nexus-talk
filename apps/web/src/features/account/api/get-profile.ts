import { http } from "@/lib/http";
import { unwrapApiResponse } from "@/lib/api-response";
import type { UserPayload } from "@/features/auth/api/types";

export async function getAccountProfile(): Promise<UserPayload> {
  const response = await http.get("/account/profile");
  return unwrapApiResponse<UserPayload>(response);
}
