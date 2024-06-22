import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authenticator } from "~/routes/auth.server";

export const loader = ({ request }: LoaderFunctionArgs) => {
  return authenticator.authenticate("google", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
