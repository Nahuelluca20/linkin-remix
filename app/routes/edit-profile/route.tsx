import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { db } from "db";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/Button";
import { TextField } from "~/components/ui/TextField";
import { SessionStorage } from "~/modules/session.server";

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(5).max(320).optional(),
  email: z.string().min(5).max(320).optional(),
});

export async function loader({ context, request }: LoaderFunctionArgs) {
  const user = await SessionStorage.requireUser(context, request);

  return json({ user: user });
}

export async function action({ context, request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const parseData = formSchema.safeParse({
    id: formData.get("id") !== "" && Number(formData.get("id")),
    name: formData.get("name"),
  });

  if (parseData.success) {
    const { DB } = context.cloudflare.env;
    const updateUser = await db(DB)
      .updateTable("users")
      .set({
        name: parseData.data.name,
      })
      .where("id", "=", parseData.data.id)
      .executeTakeFirst();

    if (updateUser) {
      SessionStorage.updateUser(context, request, {
        name: parseData.data.name,
      });
    }

    return json({
      success: true,
      updatedRows: Number(updateUser.numUpdatedRows),
    });
  } else {
    return json(
      { success: false, error: "Error when try update user" },
      { status: 400 }
    );
  }
}

export default function Route() {
  const { user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [name, setName] = useState(user?.name ?? "");
  const [isModified, setIsModified] = useState(false);

  const checkModification = (field: string, value: string) => {
    if (value === "") {
      return setIsModified(false);
    }

    if (field === "name" && value !== user?.name) {
      setIsModified(true);
    } else {
      setIsModified(name !== user?.name);
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-bold">Edit Profile</h1>
      <fetcher.Form className="max-w-[1200px]" method="post">
        <div className="display md:flex gap-6">
          <div className="space-y-2 w-full max-w-[250px]">
            <input type="hidden" name="id" value={user?.id ?? ""} />
            <TextField
              isRequired
              label="Name"
              name="name"
              defaultValue={user?.name ?? ""}
              type="text"
              onChange={(name) => {
                setName(name);
                checkModification("name", name);
              }}
            />
            <TextField
              isRequired
              isDisabled
              label="email"
              name="email"
              defaultValue={user?.email ?? ""}
              type="email"
            />
          </div>
          <div className="my-2 flex flex-col items-center">
            <img
              src={user?.profile_image ?? ""}
              alt={user?.name + "profile-image"}
              className="w-[100px] h-[100px] rounded-full"
            />
          </div>
        </div>
        <Button
          isDisabled={
            !isModified || fetcher.state !== "idle" || fetcher.data?.success
          }
          className="mt-2"
          type="submit"
        >
          Edit
        </Button>
      </fetcher.Form>
    </section>
  );
}
