import { http } from "@/lib/http";

export type CreatePasswordPayload = {
  newPassword: string;
};

type CreatePasswordResponse = {
  message: string;
};

export async function createPassword(
  payload: CreatePasswordPayload,
): Promise<CreatePasswordResponse> {
  const response = await http.patch<CreatePasswordResponse>(
    "/account/password/create",
    payload,
  );

  return response.data;
}
