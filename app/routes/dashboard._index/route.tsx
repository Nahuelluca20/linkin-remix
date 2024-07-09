import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { db } from "db";
import { Heading } from "react-aria-components";
import { Button } from "~/components/ui/Button";
import { TextField } from "~/components/ui/TextField";
import { SessionStorage } from "~/modules/session.server";
import { ActionData, LoaderData } from "./types";
import { instagramAccountSchema } from "./schemas";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const user = await SessionStorage.requireUser(context, request);

  if (user.id) {
    const instagramAccount = await db(context.cloudflare.env.DB)
      .selectFrom("instagram_account")
      .select(["name", "account_tag", "account_link"])
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    if (instagramAccount) {
      return json<LoaderData>({ success: true, response: instagramAccount });
    }
  }

  return json<LoaderData>(
    { success: false, response: "Error when get instagram account" },
    { status: 400 }
  );
}

export async function action({ context, request }: ActionFunctionArgs) {
  const user = await SessionStorage.requireUser(context, request);

  if (user.id) {
    const formData = await request.formData();
    const parseData = instagramAccountSchema.safeParse({
      name: formData.get("name"),
      account_tag: formData.get("account-tag"),
      account_link: formData.get("account-link"),
      user_id: Number(user.id),
    });

    if (parseData.success) {
      try {
        const addAccount = await db(context.cloudflare.env.DB)
          .insertInto("instagram_account")
          .values({
            name: parseData.data.name,
            account_tag: parseData.data.account_tag,
            account_link: parseData.data.account_link,
            user_id: parseData.data.user_id,
          })
          .executeTakeFirst();

        if (!addAccount) {
          return json<ActionData>(
            { success: false, error: "Failed to add account" },
            { status: 400 }
          );
        }

        return json<ActionData>({ success: true, user });
      } catch (dbError) {
        console.error("Database error:", dbError);
        return json<ActionData>(
          { success: false, error: "There was an error try again later" },
          { status: 500 }
        );
      }
    } else {
      return json<ActionData>(
        { success: false, error: parseData.error.format() },
        { status: 400 }
      );
    }
  }
}

export default function Route() {
  const data = useLoaderData<typeof loader>();

  const fetcher = useFetcher<typeof action>();
  const accountExists = data.success;

  return (
    <div className="mt-10">
      <Heading className="text-lg font-semibold mb-2" level={3}>
        {accountExists ? "Your Account" : "No associated account"}
      </Heading>
      <fetcher.Form method="POST" className="max-w-[320px] space-y-2">
        <TextField
          isRequired
          label="Name"
          name="name"
          type="text"
          defaultValue={accountExists ? data.response.name : ""}
          isDisabled={accountExists}
          validate={(value) => {
            const result = instagramAccountSchema.shape.name.safeParse(value);
            return result.success ? null : result.error.errors[0].message;
          }}
        />
        <TextField
          isRequired
          label="Account Tag"
          name="account-tag"
          type="text"
          defaultValue={accountExists ? data.response.account_tag : ""}
          isDisabled={accountExists}
          validate={(value) => {
            const result =
              instagramAccountSchema.shape.account_tag.safeParse(value);
            return result.success ? null : result.error.errors[0].message;
          }}
        />
        <TextField
          isRequired
          label="Account Link"
          name="account-link"
          type="url"
          defaultValue={accountExists ? data.response.account_link : ""}
          isDisabled={accountExists}
          validate={(value) => {
            const result =
              instagramAccountSchema.shape.account_link.safeParse(value);
            return result.success ? null : result.error.errors[0].message;
          }}
        />
        {fetcher?.data?.success === false && (
          <p className="text-red-500">{String(fetcher?.data.error)}</p>
        )}
        {!accountExists && <Button type="submit">Add Account</Button>}
      </fetcher.Form>
    </div>
  );
}
