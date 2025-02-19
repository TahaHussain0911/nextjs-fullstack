import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, { message: "Too short content" })
    .max(300, { message: "Content too long" }),
});
