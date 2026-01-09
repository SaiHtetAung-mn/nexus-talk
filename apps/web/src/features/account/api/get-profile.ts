import { http } from "@/lib/http";
import type { UserPayload } from "@/features/auth/api/types";

export async function getAccountProfile(): Promise<UserPayload> {
  const response = await http.get<UserPayload>("/account/profile");
  return response.data;
}
