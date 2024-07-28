import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getAccountName, getPosts } from "./queries";
import { InstagramPostTable } from "db/tables-interfaces/instagram-posts-table";

type LoaderData =
  | {
      success: true;
      reponse: { posts: InstagramPostTable[]; accountName: string | undefined };
    }
  | { success: false; error: string };

export async function loader({ context, params }: LoaderFunctionArgs) {
  const accountId = Number(params["account-id"]);
  const accountName = await getAccountName(context, accountId);

  if (accountId) {
    const posts = await getPosts(context, accountId);
    return posts
      ? json<LoaderData>(
          {
            success: true,
            reponse: { posts: posts, accountName: accountName?.name },
          },
          { status: 200 }
        )
      : json<LoaderData>(
          { success: false, error: "Posts not found" },
          { status: 404 }
        );
  } else {
    return json<LoaderData>(
      { success: false, error: "Account ID not found" },
      { status: 400 }
    );
  }
}

export default function Route() {
  const loaderData = useLoaderData<typeof loader>();

  if (!loaderData.success) {
    return (
      <div>
        <h1 className="text-red-600 text-2xl font-semibold">
          {loaderData.error}
        </h1>
      </div>
    );
  }

  return (
    <div>
      <h1>All Post of {loaderData.reponse.accountName ?? "this Account"}</h1>
      <div className="mt-10 w-full max-w-[680px] mx-auto grid">
        {loaderData.reponse.posts.map((item) => (
          <Link
            key={item.id}
            to={item.external_link}
            target="_blank"
            rel="noreferrer"
          >
            <iframe
              src={item.image_url}
              width={200}
              height={200}
              className="w-full h-full max-w-[103px] max-h-[103px] md:max-w-[181px] md:max-h-[181px] lg:max-w-[237px] lg:max-h-[237px]"
              title={`post-${item.post_name ?? item.id}`}
            ></iframe>
          </Link>
        ))}
      </div>
    </div>
  );
}
