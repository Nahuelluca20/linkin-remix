import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { db } from "db";
import { Heading } from "react-aria-components";
import { getInstagramImageUrl } from "utils/get-instagram-image";
import { z } from "zod";
import { Button } from "~/components/ui/Button";
import { TextField } from "~/components/ui/TextField";
import { SessionStorage } from "~/modules/session.server";

type LoaderData =
  | { success: true; id: number | undefined }
  | { success: false; error: string };

export async function loader({ context, request }: LoaderFunctionArgs) {
  const user = await SessionStorage.requireUser(context, request);
  if (user.id) {
    const getAccount = await db(context.cloudflare.env.DB)
      .selectFrom("instagram_account")
      .select(["id"])
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    return getAccount
      ? json<LoaderData>({ success: true, id: getAccount.id }, { status: 200 })
      : json<LoaderData>(
          { success: false, error: "Account not found" },
          { status: 400 }
        );
  }

  return json<LoaderData>({ success: false, error: "User not found" });
}

const instagramPostSchema = z.object({
  image_url: z.string().url(),
  external_link: z.string().url(),
  account_id: z.number(),
});

export async function action({ context, request }: ActionFunctionArgs) {
  const user = await SessionStorage.requireUser(context, request);
  if (user.id) {
    const formData = await request.formData();
    const parseData = instagramPostSchema.safeParse({
      image_url: formData.get("post-url"),
      external_link: formData.get("external-url"),
      account_id: user.id,
    });
    // https://www.instagram.com/p/C9MxEt5tzr5/?igsh=MXhwam55bGV3cTh1Yw%3D%3D
    if (parseData.success) {
      const getImageFromPost =
        (await getInstagramImageUrl(parseData.data.image_url)) ?? "";
      const addPost = db(context.cloudflare.env.DB)
        .insertInto("instagram_posts")
        .values({
          image_url: getImageFromPost,
          external_link: parseData.data.external_link,
          account_id: 29,
        });
      if (addPost) {
        return null;
      }
    } else {
      console.log("no succes");
    }
  }

  return null;
}

export default function Route() {
  const loaderData = useLoaderData<typeof loader>();
  if (!loaderData?.success) {
    return (
      <div className="grid mt-20 justify-items-center justify-center w-full">
        <Heading level={4} className="text-2xl font-semibold text-red-600">
          {loaderData?.error}
        </Heading>
        <p>Add an account to be able to add posts</p>
      </div>
    );
  }

  return (
    <div>
      <Form method="post" className="max-w-[320px] space-y-2">
        <TextField
          isRequired
          label="Post URL"
          name="post-url"
          type="url"
          isDisabled={!loaderData?.success}
          validate={(value) => {
            const result = instagramPostSchema.shape.image_url.safeParse(value);
            return result.success ? null : result.error.errors[0].message;
          }}
        />
        <TextField
          isRequired
          label="External URL"
          name="external-url"
          type="url"
          isDisabled={!loaderData?.success}
          validate={(value) => {
            const result =
              instagramPostSchema.shape.external_link.safeParse(value);
            return result.success ? null : result.error.errors[0].message;
          }}
        />
        <Button type="submit">Add post</Button>
      </Form>
    </div>
  );
}
