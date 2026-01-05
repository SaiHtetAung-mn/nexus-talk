import { http } from "@/lib/http";
import type { UserPayload } from "@/features/auth/api/types";

type CurrentUserResponse = {
  user: UserPayload;
};

export async function getCurrentUser(): Promise<UserPayload> {
  const response = await http.get<CurrentUserResponse>("/auth/me");
  return response.data.user;
}
