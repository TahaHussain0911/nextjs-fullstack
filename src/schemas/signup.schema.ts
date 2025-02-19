import { z } from "zod";
export const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be of 3 characters")
    .regex(/^[A-z0-9_]+$/, "Username cannot have special characters"),
  email: z.string().email({ message: "Invalid Email" }),
  password: z.string().min(8, { message: "Password must be of 8 characters" }),
});
