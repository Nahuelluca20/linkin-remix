import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/Button";
import { TextField } from "~/components/ui/TextField";
import { SessionStorage } from "~/modules/session.server";

// const imageSchema = z.object({
//   file: z
//     .instanceof(File)
//     .refine(
//       (file) => file.size <= 5000000,
//       "The file must be smaller than 5 MB."
//     )
//     .refine(
//       (file) => ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
//       "The file must be smaller than 5 MB."
//     ),
// });

const formSchema = z.object({
  name: z.string().min(5).max(320).optional(),
  email: z.string().min(5).max(320).optional(),
  // image: imageSchema,
});

export async function loader({ context, request }: LoaderFunctionArgs) {
  await SessionStorage.requireUser(context, request);
  const user = await SessionStorage.readUser(context, request);
  if (!user) {
    redirect("/login");
  }

  return json({ user: user });
}

export async function action({ context, request }: ActionFunctionArgs) {
  const formData = await request.formData();
  console.log(formData.get("file"));
  const parseData = formSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    // image: formData.get("file"),
  });

  if (parseData.success) {
    console.log("success papá");
  } else {
    console.log("unseccess papito");
  }

  return null;
}

export default function Route() {
  const { user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <section>
      <h1 className="text-2xl font-bold">Edit Profile</h1>
      <fetcher.Form className="max-w-[1200px]" method="post">
        <div className="display md:flex gap-6">
          <div className="space-y-2">
            <TextField
              isRequired
              label="Name"
              name="name"
              defaultValue={user?.name ?? ""}
              type="text"
            />
            <TextField
              isRequired
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
            {/* <input
              id="file"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
            />
            <label
              htmlFor="file"
              className="cursor-pointer text-sm inline-block mt-2 px-2 py-2 bg-blue-500 text-white rounded"
            >
              Change Image
            </label> */}
          </div>
        </div>
        <Button className="mt-2" type="submit">
          Edit
        </Button>
      </fetcher.Form>
    </section>
  );
}
