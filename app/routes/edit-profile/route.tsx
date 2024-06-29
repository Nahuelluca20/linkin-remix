import { json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/Button";
import { TextField } from "~/components/ui/TextField";
import { SessionStorage } from "~/modules/session.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const user = await SessionStorage.readUser(context, request);
  if (!user) {
    redirect("/login");
  }

  return json({ user: user });
}

export default function Route() {
  const { user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <section>
      <h1 className="text-2xl font-bold">Edit Profile</h1>
      <fetcher.Form className="max-w-[1200px]">
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
          <div
            className={`w-[100px] h-[100px] bg-red-200 bg-[url(${user?.profile_image})]`}
          >
            <input
              id="file"
              type="file"
              height={10}
              width={10}
              placeholder="dass"
              accept="image/png, image/jpeg, image/jpg"
              className={`rounded-full bg-[url(${user?.profile_image})] mt-2`}
              // defaultValue={user?.profile_image ?? ""}
              // src={user?.profile_image ?? ""}
              // alt={user?.name + "profile-image"}
            />
          </div>
        </div>
        <Button isDisabled className={"mt-2"} type="submit">
          Edit
        </Button>
      </fetcher.Form>
    </section>
  );
}
