import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { SessionStorage } from "~/modules/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  await SessionStorage.requireUser(context, request);
  return json(null);
}

export async function action({ request, context }: ActionFunctionArgs) {
  return await SessionStorage.logout(context, request);
}

export default function route() {
  return (
    <div>
      <h1>dashboard</h1>
      <Form method="post" reloadDocument>
        <button type="submit">logout</button>
      </Form>
    </div>
  );
}
