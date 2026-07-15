import { http } from "@/lib/http";
import { unwrapApiResponse } from "@/lib/api-response";
import type { UserPayload } from "@/features/auth/api/types";

export type UpdateProfilePayload = {
  name: string;
  username: string;
};

export async function updateAccountProfile(
  payload: UpdateProfilePayload,
): Promise<UserPayload> {
  const response = await http.patch("/account/profile", payload);
  return unwrapApiResponse<UserPayload>(response);
}
