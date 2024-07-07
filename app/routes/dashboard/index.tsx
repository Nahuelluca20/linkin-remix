import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Outlet } from "@remix-run/react";
import { Heading } from "react-aria-components";
import { ButtonLink } from "~/components/ui/LinkButton";
import { SessionStorage } from "~/modules/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  await SessionStorage.requireUser(context, request);
  return json(null);
}

export async function action({ request, context }: ActionFunctionArgs) {
  return await SessionStorage.logout(context, request);
}

export default function Route() {
  return (
    <section>
      <header className="flex flex-col gap-2 md:flex-row  justify-between items-start">
        <div>
          <Heading level={2} className="text-2xl font-bold">
            Dashboard
          </Heading>
          <Heading
            level={3}
            className="dark:text-gray-400 text-gray-500 font-semibold mt-0"
          >
            manage your data here
          </Heading>
        </div>
        <ButtonLink to={"add-post"} variant="outlined">
          See your page
        </ButtonLink>
      </header>
      <div className="my-5 flex items-center gap-5">
        <ButtonLink to={"add-post"}>Add Post</ButtonLink>
        <ButtonLink variant="secondary" to={"add-post"}>
          View all posts
        </ButtonLink>
      </div>

      <Outlet />
      {/* <Form method="post" reloadDocument>
        <button type="submit">logout</button>
      </Form> */}
    </section>
  );
}
