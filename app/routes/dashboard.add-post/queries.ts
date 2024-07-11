import { AppLoadContext } from "@remix-run/cloudflare";
import { db } from "db";
import { InstagramPostTable } from "db/tables-interfaces/instagram-posts-table";

export async function getAccount(context: AppLoadContext, userId: number) {
  return await db(context.cloudflare.env.DB)
    .selectFrom("instagram_account")
    .select(["id"])
    .where("user_id", "=", userId)
    .executeTakeFirst();
}

export async function AddPost(
  context: AppLoadContext,
  postData: InstagramPostTable
) {
  return await db(context.cloudflare.env.DB)
    .insertInto("instagram_posts")
    .values({
      ...postData,
    })
    .returning(["account_id"])
    .executeTakeFirst();
}
