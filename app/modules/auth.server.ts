import type { AppLoadContext, SessionStorage } from "@remix-run/cloudflare";

import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { db } from "db";
import { User } from "./session.server";

export class Auth {
  protected authenticator: Authenticator<User>;
  protected sessionStorage: SessionStorage;

  public authenticate: Authenticator<User>["authenticate"];

  constructor(context: AppLoadContext) {
    const {
      COOKIE_SESSION_SECRET,
      ENVIROMENT,
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
    } = context.cloudflare.env;
    this.sessionStorage = createCookieSessionStorage({
      cookie: {
        name: "linkin:auth",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        secure: ENVIROMENT === "PROD",
        secrets: [COOKIE_SESSION_SECRET!],
      },
    });

    this.authenticator = new Authenticator<User>(this.sessionStorage, {
      throwOnError: true,
      sessionKey: "token",
    });

    this.authenticator = new Authenticator<User>(this.sessionStorage);

    this.authenticator.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID!,
          clientSecret: GOOGLE_CLIENT_SECRET!,
          callbackURL:
            ENVIROMENT === "PROD"
              ? "https://linkin-remix.pages.dev/auth/google/callback"
              : "http://localhost:5173/auth/google/callback",
        },
        async ({ profile }) => {
          const { DB } = context.cloudflare.env;
          const findUser = await db(DB)
            .selectFrom("users")
            .selectAll()
            .where("email", "=", `${profile.emails[0].value}`)
            .executeTakeFirst();
          if (findUser) return findUser;

          const createUser = await db(DB)
            .insertInto("users")
            .values({
              email: profile.emails[0].value,
              name: profile.name.givenName,
              profile_image: profile.photos[0].value,
            })
            .returning(["id", "email", "name", "profile_image"])
            .executeTakeFirstOrThrow();
          if (createUser) return createUser;

          return {
            name: profile.name.givenName,
            email: profile.emails[0].value,
            profile_image: profile.photos[0].value,
          };
        }
      )
    );

    this.authenticate = this.authenticator.authenticate.bind(
      this.authenticator
    );
  }

  public async clear(request: Request) {
    const session = await this.sessionStorage.getSession(
      request.headers.get("cookie")
    );
    return this.sessionStorage.destroySession(session);
  }
}
