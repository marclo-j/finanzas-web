import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { loans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

let db: Awaited<ReturnType<typeof import("./helpers").getTestDb>>;

async function fullClean() {
  if (!db) return;
  try { await db!.delete(loans); } catch {}
}

describe("Loans CRUD", () => {
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

  it("CREATE - inserta una deuda en centavos", async () => {
    const [row] = await db!.insert(loans).values({
      person: "Juan Pérez", desc: "Préstamo para mudanza", amount: 50000,
      lentDate: "2026-05-01", dueDate: "2026-07-01", status: "pendiente", paidAmount: 0,
    }).returning();

    expect(row.person).toBe("Juan Pérez");
    expect(row.amount).toBe(50000);
    expect(row.status).toBe("pendiente");
    expect(row.id).toBeGreaterThan(0);
  });

  it("READ - lista deudas", async () => {
    await db!.insert(loans).values([
      { person: "Ana", desc: "Deuda 1", amount: 20000, lentDate: "2026-06-01", dueDate: "2026-08-01", status: "pendiente", paidAmount: 0 },
      { person: "Luis", desc: "Deuda 2", amount: 15000, lentDate: "2026-05-15", dueDate: "2026-07-15", status: "pendiente", paidAmount: 0 },
    ]);

    const rows = await db!.select().from(loans).orderBy(desc(loans.createdAt));
    expect(rows.length).toBe(2);
  });

  it("UPDATE - marca deuda como pagada", async () => {
    const [created] = await db!.insert(loans).values({
      person: "María", desc: "Test", amount: 30000, lentDate: "2026-06-01", dueDate: "2026-08-01", status: "pendiente", paidAmount: 0,
    }).returning();

    const [updated] = await db!.update(loans)
      .set({ status: "pagada", paidAmount: 30000 })
      .where(eq(loans.id, created.id))
      .returning();

    expect(updated.status).toBe("pagada");
    expect(updated.paidAmount).toBe(30000);
  });

  it("DELETE - elimina una deuda", async () => {
    const [created] = await db!.insert(loans).values({
      person: "Pedro", desc: "Test delete", amount: 10000, lentDate: "2026-06-01", dueDate: "2026-07-01", status: "pendiente", paidAmount: 0,
    }).returning();

    await db!.delete(loans).where(eq(loans.id, created.id));
    const remaining = await db!.select().from(loans).where(eq(loans.id, created.id));
    expect(remaining.length).toBe(0);
  });
});
