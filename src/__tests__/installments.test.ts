import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { transactions, installments as installmentsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

let db: Awaited<ReturnType<typeof import("./helpers").getTestDb>>;
let cleanDB: () => Promise<void>;

async function fullClean() {
  if (!db) return;
  try { await db!.delete(installmentsTable); } catch {}
  try { await db!.delete(transactions); } catch {}
}

describe("Installments CRUD", () => {
  beforeAll(async () => {
    const h = await import("./helpers");
    if (h.skipIfNoDb()) return;
    db = h.getTestDb()!;
    cleanDB = h.cleanDB;
    await fullClean();
  });

  afterAll(async () => {
    await fullClean();
  });

  beforeEach(async () => {
    await fullClean();
  });

  it("crea installment_details", async () => {
    const [tx] = await db!.insert(transactions).values({
      desc: "Compra en cuotas", amount: 2400, type: "egreso", category: "Otro",
      card: "BBVA Crédito", date: "2026-06-01", installments: 6,
    }).returning();

    const vals = [];
    for (let i = 1; i <= 6; i++) {
      const d = new Date("2026-06-01");
      d.setMonth(d.getMonth() + i);
      vals.push({
        transactionId: tx.id, number: i, amount: 400,
        dueDate: d.toISOString().slice(0, 10), status: "pending" as const,
      });
    }
    await db!.insert(installmentsTable).values(vals);

    const all = await db!.select().from(installmentsTable);
    const related = all.filter(i => i.transactionId === tx.id);
    expect(related.length).toBe(6);
    expect(related.reduce((s, i) => s + i.amount, 0)).toBe(2400);
  });

  it("actualiza estado a pagada", async () => {
    const [tx] = await db!.insert(transactions).values({
      desc: "Test cuota", amount: 600, type: "egreso", category: "Otro",
      card: "IO Crédito", date: "2026-07-01", installments: 3,
    }).returning();

    const [inst] = await db!.insert(installmentsTable).values({
      transactionId: tx.id, number: 1, amount: 200, dueDate: "2026-08-01", status: "pending",
    }).returning();

    const now = new Date().toISOString();
    const [updated] = await db!.update(installmentsTable)
      .set({ status: "paid", paidAt: now })
      .where(eq(installmentsTable.id, inst.id))
      .returning();

    expect(updated.status).toBe("paid");
    expect(updated.paidAt).toBeTruthy();
  });

  it("filtra cuotas por tarjeta con JOIN", async () => {
    const [txIo] = await db!.insert(transactions).values({
      desc: "Compra IO", amount: 300, type: "egreso", category: "Otro",
      card: "IO Crédito", date: "2026-08-01", installments: 1,
    }).returning();
    const [txBbva] = await db!.insert(transactions).values({
      desc: "Compra BBVA", amount: 300, type: "egreso", category: "Otro",
      card: "BBVA Crédito", date: "2026-08-01", installments: 1,
    }).returning();

    const inst1 = await db!.insert(installmentsTable).values({
      transactionId: txIo.id, number: 1, amount: 300, dueDate: "2026-09-01", status: "pending",
    }).returning();
    await db!.insert(installmentsTable).values({
      transactionId: txBbva.id, number: 1, amount: 300, dueDate: "2026-09-01", status: "pending",
    }).returning();

    const result = await db!.select().from(installmentsTable)
      .innerJoin(transactions, eq(installmentsTable.transactionId, transactions.id))
      .where(eq(transactions.card, "IO Crédito"));

    expect(result.length).toBe(1);
    expect(result[0].transactions.card).toBe("IO Crédito");
  });
});
