import { http } from "@/lib/http";
import type { UserPayload } from "@/features/auth/api/types";

export type UpdateProfilePayload = {
  name: string;
  username: string;
};

export async function updateAccountProfile(
  payload: UpdateProfilePayload,
): Promise<UserPayload> {
  const response = await http.patch<UserPayload>("/account/profile", payload);
  return response.data;
}
