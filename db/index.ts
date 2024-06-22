import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
// import { GlossaryCategory } from "./tables-interfaces/glossary-category";

interface Database {
  // glossary_category: GlossaryCategory;
}

export const db = (DB: D1Database) => {
  const db = new Kysely<Database>({ dialect: new D1Dialect({ database: DB }) });
  return db;
};
