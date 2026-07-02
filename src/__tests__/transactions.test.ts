import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { transactions, installments as installmentsTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

let db: Awaited<ReturnType<typeof import("./helpers").getTestDb>>;

async function fullClean() {
  if (!db) return;
  try { await db!.delete(installmentsTable); } catch {}
  try { await db!.delete(transactions); } catch {}
}

describe("Transactions CRUD", () => {
  beforeAll(async () => {
    const { getTestDb, skipIfNoDb } = await import("./helpers");
    if (skipIfNoDb()) return;
    db = getTestDb()!;
    await fullClean();
  });

  afterAll(async () => {
    await fullClean();
  });

  beforeEach(async () => {
    await fullClean();
  });

  it("CREATE - inserta una transacción en centavos", async () => {
    const [row] = await db!.insert(transactions).values({
      desc: "Test compra", amount: 15050, type: "egreso",
      category: "Alimentación", card: "BCP Débito", date: "2026-06-15", installments: 1,
    }).returning();

    expect(row.desc).toBe("Test compra");
    expect(row.amount).toBe(15050);
    expect(row.id).toBeGreaterThan(0);
  });

  it("READ - lista transacciones ordenadas por fecha", async () => {
    await db!.insert(transactions).values([
      { desc: "Segundo", amount: 20000, type: "ingreso", category: "Sueldo", card: "BCP Débito", date: "2026-07-01", installments: 1 },
      { desc: "Primero", amount: 10000, type: "egreso", category: "Transporte", card: "BCP Débito", date: "2026-06-01", installments: 1 },
    ]);

    const rows = await db!.select().from(transactions).orderBy(desc(transactions.date));
    expect(rows.length).toBe(2);
    expect(rows[0].desc).toBe("Segundo");
    expect(rows[1].desc).toBe("Primero");
  });

  it("UPDATE - actualiza descripción y monto", async () => {
    const [created] = await db!.insert(transactions).values({
      desc: "Original", amount: 10000, type: "egreso", category: "Otro", card: "BCP Débito", date: "2026-06-01", installments: 1,
    }).returning();

    const [updated] = await db!.update(transactions)
      .set({ desc: "Actualizado", amount: 20000 })
      .where(eq(transactions.id, created.id))
      .returning();

    expect(updated.desc).toBe("Actualizado");
    expect(updated.amount).toBe(20000);
  });

  it("DELETE - elimina una transacción", async () => {
    const [created] = await db!.insert(transactions).values({
      desc: "Para borrar", amount: 5000, type: "egreso", category: "Otro", card: "BCP Débito", date: "2026-06-01", installments: 1,
    }).returning();

    await db!.delete(transactions).where(eq(transactions.id, created.id));
    const remaining = await db!.select().from(transactions).where(eq(transactions.id, created.id));
    expect(remaining.length).toBe(0);
  });

  it("CREATE con cuotas - inserta transaction + installment_details en centavos", async () => {
    const groupId = crypto.randomUUID();
    const [tx] = await db!.insert(transactions).values({
      desc: "Laptop cuotas", amount: 360000, type: "egreso", category: "Otro", card: "IO Crédito",
      date: "2026-06-15", installments: 12, installmentGroupId: groupId,
    }).returning();

    const perInstallment = Math.floor(360000 / 12);
    const remainder = 360000 - perInstallment * 11;
    const insValues = [];
    for (let i = 1; i <= 12; i++) {
      const d = new Date("2026-06-15");
      d.setMonth(d.getMonth() + i);
      insValues.push({
        transactionId: tx.id, number: i,
        amount: i === 12 ? remainder : perInstallment,
        dueDate: d.toISOString().slice(0, 10), status: "pending" as const,
      });
    }
    await db!.insert(installmentsTable).values(insValues);

    const allInsts = await db!.select().from(installmentsTable);
    const related = allInsts.filter(i => i.transactionId === tx.id);
    expect(related.length).toBe(12);
    const totalInst = related.reduce((s, i) => s + i.amount, 0);
    expect(totalInst).toBe(360000);
  });
});
