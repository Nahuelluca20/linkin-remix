import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Heading } from "react-aria-components";
import { getInstagramImageUrl } from "utils/get-instagram-image";
import { Button } from "~/components/ui/Button";
import { TextField } from "~/components/ui/TextField";
import { SessionStorage } from "~/modules/session.server";
import { ActionData, LoaderData } from "./types";
import { instagramPostSchema } from "./schemas";
import { AddPost, getAccount } from "./queries";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const user = await SessionStorage.requireUser(context, request);
  if (user.id) {
    const account = await getAccount(context, user.id);

    return account
      ? json<LoaderData>({ success: true, id: account.id }, { status: 200 })
      : json<LoaderData>(
          { success: false, error: "Account not found" },
          { status: 400 }
        );
  }

  return json<LoaderData>({ success: false, error: "User not found" });
}

export async function action({ context, request }: ActionFunctionArgs) {
  const user = await SessionStorage.requireUser(context, request);
  if (user.id) {
    const formData = await request.formData();
    const imageUrl = await getInstagramImageUrl(
      String(formData.get("post-url"))
    );
    if (!imageUrl) {
      return json<ActionData>(
        { success: false, error: "Failed to fetch image URL" },
        { status: 400 }
      );
    }

    const parseData = instagramPostSchema.safeParse({
      image_url: imageUrl,
      external_link: formData.get("external-url"),
      post_name: formData.get("post-name"),
      account_id: Number(formData.get("account-id")),
    });
    if (parseData.success) {
      try {
        const post = await AddPost(context, { ...parseData.data });

        if (post) {
          return redirect(`/posts/${post.account_id}`);
        } else {
          return json<ActionData>(
            { success: false, error: "Failed to insert post" },
            { status: 500 }
          );
        }
      } catch (error) {
        console.error("Database error:", error);
        return json<ActionData>(
          { success: false, error: "There was an error try again later" },
          { status: 500 }
        );
      }
    }
  }

  return json<ActionData>(
    { success: false, error: "Unexpected error" },
    { status: 400 }
  );
}

export default function Route() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

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
          label="Post Name"
          name="post-name"
          type="text"
          isDisabled={!loaderData?.success}
          validate={(value) => {
            const result = instagramPostSchema.shape.post_name.safeParse(value);
            return result.success ? null : result.error.errors[0].message;
          }}
        />
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
        {loaderData.success && (
          <input
            name="account-id"
            type="hidden"
            value={String(loaderData.id)}
          />
        )}
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
        {!actionData?.success && (
          <p className="font-semibold text-red-600 text-lg">
            {actionData?.error}
          </p>
        )}
        {isSubmitting && (
          <p className="font-semibold text-gray-500 dark:text-gray-300 text-md">
            Loading...
          </p>
        )}
        <Button type="submit">Add post</Button>
      </Form>
    </div>
  );
}
