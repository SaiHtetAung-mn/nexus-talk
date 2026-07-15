import { http } from "@/lib/http";
import { unwrapApiResponse } from "@/lib/api-response";
import type { UserPayload } from "@/features/auth/api/types";

export async function discoverUsers(query: string): Promise<UserPayload[]> {
  const response = await http.get("/users/discover", {
    params: query.trim() ? { q: query.trim() } : undefined,
  });

  return unwrapApiResponse<UserPayload[]>(response);
}
