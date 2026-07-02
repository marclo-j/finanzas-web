import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { transactions, loans, installments } from "@/db/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export function getTestDb() {
  if (_db) return _db;
  const url = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  const token = process.env.TEST_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) {
    console.warn("[helpers] Faltan credenciales");
    return null;
  }
  const client = createClient({ url, authToken: token });
  _db = drizzle(client);
  return _db;
}

export function skipIfNoDb(): boolean {
  const url = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  const token = process.env.TEST_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) {
    console.warn("SALTANDO TEST: falta TEST_DATABASE_URL / TEST_TURSO_AUTH_TOKEN en .env.local");
    return true;
  }
  return false;
}

export async function cleanDB() {
  const db = getTestDb();
  if (!db) return;
  try { await db.delete(installments); } catch {}
  try { await db.delete(transactions); } catch {}
  try { await db.delete(loans); } catch {}
}
