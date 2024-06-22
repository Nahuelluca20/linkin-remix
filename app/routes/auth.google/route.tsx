// app/routes/auth.google.tsx
import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { authenticator } from "~/routes/auth.server";

export const loader = () => redirect("/login");

export const action = ({ request }: ActionFunctionArgs) => {
  return authenticator.authenticate("google", request);
};
