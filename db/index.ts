import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { IntagramAccountTable } from "./tables-interfaces/instagram-account-table";
import { UserTable } from "./tables-interfaces/user-table";

interface Database {
  instagram_account: IntagramAccountTable;
  users: UserTable;
}

export const db = (DB: D1Database) => {
  const db = new Kysely<Database>({ dialect: new D1Dialect({ database: DB }) });
  return db;
};
