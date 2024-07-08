import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { db } from "db";
import { Heading } from "react-aria-components";
import { z } from "zod";
import { Button } from "~/components/ui/Button";
import { TextField } from "~/components/ui/TextField";
import { SessionStorage } from "~/modules/session.server";

interface InstagramAccount {
  name: string;
  account_tag: string;
  account_link: string;
}

type LoaderData =
  | { success: true; response: InstagramAccount }
  | { success: false; response: string };

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

const instagramAccountSchema = z.object({
  name: z.string().min(4, { message: "Must be at least 4 characters" }),
  account_tag: z.string().min(4, { message: "Must be at least 4 characters" }),
  account_link: z.string().url(),
});

export async function action({ context, request }: ActionFunctionArgs) {
  const user = await SessionStorage.requireUser(context, request);

  if (user.id) {
    const formData = await request.formData();
    const parseData = instagramAccountSchema.safeParse({
      name: formData.get("name"),
      account_tag: formData.get("account-tag"),
      account_link: formData.get("account-link"),
    });

    if (parseData.success) {
      console.log("success");
    } else {
      console.log("no success");
    }
  }

  return user;
}

export default function Route() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
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
        {!accountExists && <Button type="submit">Add Account</Button>}
      </fetcher.Form>
    </div>
  );
}
