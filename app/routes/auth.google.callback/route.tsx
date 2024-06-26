import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Auth } from "~/modules/auth.server";
import { SessionStorage } from "~/modules/session.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  try {
    const auth = new Auth(context);

    const user = await auth.authenticate("google", request);

    if (!user) throw redirect("/login");

    const sessionStorage = new SessionStorage(context);

    const session = await sessionStorage.read(request.headers.get("cookie"));
    session.set("user", user);

    const headers = new Headers();

    headers.append("set-cookie", await sessionStorage.commit(session));
    headers.append("set-cookie", await auth.clear(request));

    throw redirect("/", { headers });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
