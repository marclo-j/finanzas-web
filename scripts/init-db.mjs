import { createClient } from "@libsql/client";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "..", "finanzas.db");

const db = createClient({ url: `file:${dbPath}` });

await db.execute("PRAGMA journal_mode=WAL");

await db.execute(`CREATE TABLE IF NOT EXISTS transactions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  desc              TEXT    NOT NULL,
  amount            INTEGER NOT NULL,
  type              TEXT    NOT NULL,
  category          TEXT    NOT NULL,
  card              TEXT    NOT NULL,
  date              TEXT    NOT NULL,
  installments      INTEGER NOT NULL DEFAULT 1,
  installment_group_id TEXT,
  created_at        TEXT    NOT NULL DEFAULT (datetime('now'))
)`);

await db.execute(`CREATE INDEX IF NOT EXISTS tx_date_idx ON transactions(date)`);
await db.execute(`CREATE INDEX IF NOT EXISTS tx_card_inst_idx ON transactions(card, installments)`);

await db.execute(`CREATE TABLE IF NOT EXISTS loans (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  person      TEXT    NOT NULL,
  desc        TEXT    NOT NULL,
  amount      INTEGER NOT NULL,
  lent_date   TEXT    NOT NULL,
  due_date    TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'pendiente',
  paid_amount INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
)`);

await db.execute(`CREATE INDEX IF NOT EXISTS loans_created_at_idx ON loans(created_at)`);

await db.execute(`CREATE TABLE IF NOT EXISTS installments (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id),
  number         INTEGER NOT NULL,
  amount         INTEGER NOT NULL,
  due_date       TEXT    NOT NULL,
  status         TEXT    NOT NULL DEFAULT 'pending',
  paid_at        TEXT
)`);

await db.execute(`CREATE INDEX IF NOT EXISTS inst_txn_id_idx ON installments(transaction_id)`);
await db.execute(`CREATE INDEX IF NOT EXISTS inst_due_date_idx ON installments(due_date)`);

db.close();
console.log(`DB creada: ${dbPath}`);
