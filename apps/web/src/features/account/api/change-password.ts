import { http } from "@/lib/http";
import { unwrapMessageResponse } from "@/lib/api-response";

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
  const response = await http.patch(
    "/account/password",
    payload,
  );

  return unwrapMessageResponse(response);
}
