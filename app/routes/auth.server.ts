import { GoogleStrategy } from "remix-auth-google";
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/routes/sessions.server";
import { IUser } from "db/tables-interfaces/user";
import { db } from "db";

export const authenticator = new Authenticator<IUser>(sessionStorage);
const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "https://example.com/auth/google/callback",
  },
  async ({ accessToken, refreshToken, extraParams, profile, context }) => {
    if (!context) {
      throw new Error("Context is undefined");
    }

    const { DB } = context.cloudflare.env;

    const findUser = await db(DB)
      .selectFrom("users")
      .selectAll()
      .where("email", "=", `${profile.emails[0].value}`)
      .executeTakeFirst();
    if (findUser !== null) return findUser;

    const createUser = await db(DB)
      .insertInto("users")
      .values({
        email: profile.emails[0].value,
        name: profile.name.givenName,
      })
      .returning(["id", "email", "name"])
      .executeTakeFirstOrThrow();
    if (createUser !== null) return createUser;
  }
);

authenticator.use(googleStrategy);
