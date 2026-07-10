import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env.local");
  process.exit(1);
}

const db = createClient({ url, authToken });

async function rename() {
  const result = await db.execute({
    sql: "UPDATE transactions SET card = 'Efectibank' WHERE card = 'Cuenta Millonaria - Interbank'",
  });

  console.log(`✅ Renamed ${result.rowsAffected} transaction(s) from "Cuenta Millonaria - Interbank" to "Efectibank"`);

  const check = await db.execute({
    sql: "SELECT id, card FROM transactions WHERE card LIKE '%Interbank%' OR card LIKE '%Millonaria%'",
  });

  if (check.rows.length === 0) {
    console.log("✅ No remaining references to 'Interbank' or 'Millonaria' in transactions");
  } else {
    console.log("⚠️  Remaining references:");
    for (const row of check.rows) {
      console.log(`   id=${row.id}, card=${row.card}`);
    }
  }
}

rename().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
