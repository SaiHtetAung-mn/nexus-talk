import { http } from "@/lib/http";

export async function logoutUser(): Promise<void> {
  await http.post("/auth/logout");
}
