import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix on Cloudflare!",
    },
  ];
};

export default function Index() {
  return (
    <section className="font-sans p-4">
      <h1 className="text-3xl">Welcome Linkin clone with Remix</h1>
      <ul className="list-disc mt-4 pl-6 space-y-2">
        <li>
          <Link
            className="text-blue-700 underline visited:text-purple-900 dark:visited:text-purple-500"
            to="/dashboard"
            rel="noreferrer"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            className="text-blue-700 underline visited:text-purple-900 dark:visited:text-purple-500"
            to="/edit-profile"
            rel="noreferrer"
          >
            Edit Profile
          </Link>
        </li>
      </ul>
    </section>
  );
}
