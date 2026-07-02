import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

function sanitizeUrl(url: string): string {
  try {
    const u = new URL(url);
    for (const p of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) {
      u.searchParams.delete(p);
    }
    return u.toString();
  } catch {
    return url;
  }
}

let _db: LibSQLDatabase | null = null;

export function getDb(): LibSQLDatabase {
  if (!_db) {
    const client = createClient({
      url: sanitizeUrl(process.env.DATABASE_URL!),
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
    _db = drizzle(client);
  }
  return _db;
}
