import { z } from "zod";

export const instagramAccountSchema = z.object({
  name: z.string().min(4, { message: "Must be at least 4 characters" }),
  account_tag: z.string().min(4, { message: "Must be at least 4 characters" }),
  account_link: z.string().url(),
  user_id: z.number(),
});
