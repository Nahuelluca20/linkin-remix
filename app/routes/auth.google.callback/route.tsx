import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Auth } from "~/modules/auth.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const auth = new Auth(context);

  return await auth.authenticate("google", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
