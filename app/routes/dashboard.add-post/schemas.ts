import { z } from "zod";

export const instagramPostSchema = z.object({
  image_url: z.string().url(),
  post_name: z.string().min(4, { message: "Must be at least 4 characters" }),
  external_link: z.string().url(),
  account_id: z.number(),
});
