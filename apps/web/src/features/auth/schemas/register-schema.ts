import { z } from "zod";

const handleRegex = /^[a-zA-Z0-9_]{3,16}$/;

export const registerSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  handle: z
    .string()
    .regex(
      handleRegex,
      "3-16 characters. Letters, numbers, and underscores only.",
    ),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterValues = z.infer<typeof registerSchema>;
