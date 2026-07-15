import { http } from "@/lib/http";
import { unwrapMessageResponse } from "@/lib/api-response";

export type CreatePasswordPayload = {
  newPassword: string;
};

type CreatePasswordResponse = {
  message: string;
};

export async function createPassword(
  payload: CreatePasswordPayload,
): Promise<CreatePasswordResponse> {
  const response = await http.patch(
    "/account/password/create",
    payload,
  );

  return unwrapMessageResponse(response);
}
