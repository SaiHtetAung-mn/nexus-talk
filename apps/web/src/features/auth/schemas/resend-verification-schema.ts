import { z } from "zod";

export const resendVerificationSchema = z.object({
  email: z.email("Enter the email you registered with"),
});

export type ResendVerificationValues = z.infer<
  typeof resendVerificationSchema
>;
