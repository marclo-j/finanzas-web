import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

let _db: LibSQLDatabase | null = null;

export function getDb(): LibSQLDatabase {
  if (!_db) {
    const client = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
    _db = drizzle(client);
  }
  return _db;
}
