/**
 * Script de importación: importa datos desde backup.json a Turso.
 *
 * Uso:
 *   $env:DATABASE_URL="libsql://..." ; $env:TURSO_AUTH_TOKEN="eyJ..." ; node scripts/import-turso.mjs
 *
 * O con Node 20+:
 *   node --env-file=.env.local scripts/import-turso.mjs
 */
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const raw = readFileSync("backup.json", "utf-8");
  const rows = JSON.parse(raw);

  let count = 0;
  for (const r of rows) {
    await db.execute({
      sql: `INSERT INTO transactions (desc, amount, type, category, card, date, installments, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      args: [r.desc, Number(r.amount), r.type, r.category, r.card, r.date, r.createdAt],
    });
    count++;
  }

  console.log(`Importadas ${count} transacciones a Turso.`);
}

main().catch(console.error);
