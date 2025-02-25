import { z } from "zod";

export const verifySchema = z.object({
  username: z.string({message:"Username is required"}),
  code: z.string().length(6, { message: "Verification code must be 6 digits" }),
});
