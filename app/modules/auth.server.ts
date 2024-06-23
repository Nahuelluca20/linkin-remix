import type { AppLoadContext, SessionStorage } from "@remix-run/cloudflare";

import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";

import { IUser } from "db/tables-interfaces/user";
import { db } from "db";

export class Auth {
  protected authenticator: Authenticator<IUser>;
  protected sessionStorage: SessionStorage;

  public authenticate: Authenticator<IUser>["authenticate"];

  constructor(context: AppLoadContext) {
    this.sessionStorage = createCookieSessionStorage({
      cookie: {
        name: "_session",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secrets: ["s3cr3t"],
      },
    });

    this.authenticator = new Authenticator<IUser>(this.sessionStorage);

    const googleStrategy = new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "http://localhost:5173/auth/google/callback",
      },
      async ({ accessToken, refreshToken, extraParams, profile }) => {
        const { DB } = context.cloudflare.env;
        const findUser = await db(DB)
          .selectFrom("users")
          .selectAll()
          .where("email", "=", `${profile.emails[0].value}`)
          .executeTakeFirst();
        console.log(findUser);
        if (findUser) return findUser;

        const createUser = await db(DB)
          .insertInto("users")
          .values({
            email: profile.emails[0].value,
            name: profile.name.givenName,
          })
          .returning(["id", "email", "name"])
          .executeTakeFirstOrThrow();
        if (createUser) return createUser;
      }
    );

    this.authenticator.use(googleStrategy);

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
