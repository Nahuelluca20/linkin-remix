import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { db } from "db";

type LoaderData =
  | { success: true; reponse: string | object }
  | { success: false; error: string };

export async function loader({ context, params }: LoaderFunctionArgs) {
  const accountId = Number(params["account-id"]);
  if (accountId) {
    const getPosts = await db(context.cloudflare.env.DB)
      .selectFrom("instagram_posts")
      .selectAll("instagram_posts")
      .where("account_id", "=", accountId)
      .orderBy("id", "desc")
      .execute();
    if (getPosts) {
      return json<LoaderData>(
        { success: true, reponse: getPosts },
        { status: 200 }
      );
    } else {
      return json<LoaderData>(
        { success: false, error: "Posts not found" },
        { status: 404 }
      );
    }
  } else {
    return json<LoaderData>(
      { success: false, error: "Account ID not found" },
      { status: 400 }
    );
  }
}

export default function Route() {
  const response = useLoaderData<typeof loader>();
  console.log(response);
  return (
    <section>
      <h1>POST ACCOUNTS</h1>
    </section>
  );
}
