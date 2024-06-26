import { LoaderFunction } from "@remix-run/cloudflare";
import type { LinksFunction } from "@remix-run/cloudflare";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css?url";
import {
  PreventFlashOnWrongTheme,
  Theme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import Header from "./components/header";
import { themeSessionResolver } from "./routes/theme-sessions.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const loader: LoaderFunction = async ({ request }) => {
  const { getTheme } = await themeSessionResolver(request);
  const theme = getTheme();

  return { theme };
};

function App() {
  const data: {
    theme: string;
  } = useLoaderData();
  const [theme] = useTheme();
  return (
    <html lang="en" data-mode={theme ?? ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data?.theme)} />
        <Meta />
        <Links />
      </head>
      <body className="px-5 max-w-[1200px] w-full mx-auto mt-10 bg-foreground">
        <Header />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const data: {
    theme: string;
  } = useLoaderData();
  return (
    <ThemeProvider
      specifiedTheme={data.theme as Theme}
      themeAction="/action/set-theme"
    >
      <App />
    </ThemeProvider>
  );
}
