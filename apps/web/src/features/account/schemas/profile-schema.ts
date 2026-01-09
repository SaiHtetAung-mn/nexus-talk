import { z } from "zod";

const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .regex(
      usernameRegex,
      "Username must be 3-16 chars. Letters, numbers, underscores.",
    ),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
