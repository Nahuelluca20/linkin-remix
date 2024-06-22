import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { IntagramAccount } from "./tables-interfaces/instagram_account";

interface Database {
  instagram_account: IntagramAccount;
}

export const db = (DB: D1Database) => {
  const db = new Kysely<Database>({ dialect: new D1Dialect({ database: DB }) });
  return db;
};
