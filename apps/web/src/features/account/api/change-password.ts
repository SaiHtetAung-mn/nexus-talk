import { http } from "@/lib/http";

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

type ChangePasswordResponse = {
  message: string;
};

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> {
  const response = await http.patch<ChangePasswordResponse>(
    "/account/password",
    payload,
  );

  return response.data;
}
