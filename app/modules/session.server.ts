import { z } from "zod";
import {
  createTypedSessionStorage,
  TypedSessionStorage,
} from "remix-utils/typed-session";
import {
  createWorkersKVSessionStorage,
  redirect,
  AppLoadContext,
} from "@remix-run/cloudflare";

export const UserSchema = z.object({
  id: z.number().optional(),
  email: z.string().email().max(320),
  name: z.string().max(320),
  profile_image: z.string().url().optional(),
});

export const ThemeSchema = z.object({
  theme: z.string(),
});

export type User = z.infer<typeof UserSchema>;
export type Theme = z.infer<typeof ThemeSchema>;

export const SessionSchema = z.object({
  user: UserSchema.optional(),
  theme: ThemeSchema.optional(),
});

export class SessionStorage {
  protected sessionStorage: TypedSessionStorage<typeof SessionSchema>;

  public read: TypedSessionStorage<typeof SessionSchema>["getSession"];
  public commit: TypedSessionStorage<typeof SessionSchema>["commitSession"];
  public destroy: TypedSessionStorage<typeof SessionSchema>["destroySession"];

  constructor(context: AppLoadContext) {
    const { auth_kv, COOKIE_SESSION_SECRET, ENVIROMENT } =
      context.cloudflare.env;

    this.sessionStorage = createTypedSessionStorage({
      sessionStorage: createWorkersKVSessionStorage({
        kv: auth_kv,
        cookie: {
          name: "linkin:session",
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
          httpOnly: true,
          sameSite: "lax",
          secure: ENVIROMENT === "PROD",
          secrets: [COOKIE_SESSION_SECRET],
        },
      }),
      schema: SessionSchema,
    });

    this.read = this.sessionStorage.getSession;
    this.commit = this.sessionStorage.commitSession;
    this.destroy = this.sessionStorage.destroySession;
  }

  static async logout(context: AppLoadContext, request: Request) {
    const sessionStorage = new SessionStorage(context);
    const session = await sessionStorage.read(request.headers.get("cookie"));

    throw redirect("/", {
      headers: { "set-cookie": await sessionStorage.destroy(session) },
    });
  }

  static async readUser(context: AppLoadContext, request: Request) {
    const sessionStorage = new SessionStorage(context);
    const session = await sessionStorage.read(request.headers.get("cookie"));

    return session.get("user");
  }

  static async updateUser(
    context: AppLoadContext,
    request: Request,
    updateUserData: Partial<User>
  ) {
    const sessionStorage = new SessionStorage(context);
    const session = await sessionStorage.read(request.headers.get("cookie"));

    const currentUser = session.get("user");
    if (!currentUser) {
      throw new Error("No user found in session");
    }

    const updateUser = { ...currentUser, ...updateUserData };
    const validatedUser = UserSchema.parse(updateUser);
    session.set("user", validatedUser);

    const headers = new Headers({
      "Set-Cookie": await sessionStorage.commit(session),
    });

    return { headers, user: validatedUser };
  }

  static async requireUser(
    context: AppLoadContext,
    request: Request,
    returnTo = "/login"
  ) {
    const maybeUser = await SessionStorage.readUser(context, request);
    if (!maybeUser) throw redirect(returnTo);

    return maybeUser;
  }
}
