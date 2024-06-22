import { createCookieSessionStorage } from "@remix-run/cloudflare";

// export the whole sessionStorage object
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: ["s3cr3t"],
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
