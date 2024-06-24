import { json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/Button";
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
  console.log(user);
  return (
    <section>
      <h1 className="text-2xl font-bold">Edit Profile</h1>
      <Button>Edit</Button>
    </section>
  );
}
