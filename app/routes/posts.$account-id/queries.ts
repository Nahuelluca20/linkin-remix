import { AppLoadContext } from "@remix-run/cloudflare";
import { db } from "db";

export async function getAccountName(
  context: AppLoadContext,
  accountId: number
) {
  return await db(context.cloudflare.env.DB)
    .selectFrom("instagram_account")
    .select("name")
    .where("id", "=", accountId)
    .executeTakeFirst();
}

export async function getPosts(context: AppLoadContext, accountId: number) {
  return await db(context.cloudflare.env.DB)
    .selectFrom("instagram_posts")
    .selectAll("instagram_posts")
    .where("account_id", "=", accountId)
    .orderBy("id", "desc")
    .execute();
}
