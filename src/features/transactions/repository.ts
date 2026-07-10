import { getDb } from "@/db/client";
import { transactions, installments } from "@/db/schema";
import { desc, eq, and, SQL, sql } from "drizzle-orm";
import type { NewInstallment } from "@/db/schema";

export const transactionRepository = {
  findAll() {
    return getDb().select().from(transactions).orderBy(desc(transactions.date));
  },

  findById(id: number) {
    return getDb().select().from(transactions).where(eq(transactions.id, id)).get();
  },

  findByCard(card: string) {
    return getDb().select()
      .from(transactions)
      .where(and(eq(transactions.card, card), eq(transactions.installments, 1)));
  },

  create(data: typeof transactions.$inferInsert) {
    return getDb().insert(transactions).values(data).returning().then(r => r[0]);
  },

  update(id: number, data: Partial<typeof transactions.$inferInsert>) {
    return getDb().update(transactions).set(data).where(eq(transactions.id, id)).returning().then(r => r[0]);
  },

  delete(id: number) {
    return getDb().delete(transactions).where(eq(transactions.id, id));
  },

  batchDeleteWithInstallments(id: number) {
    const d = getDb();
    return d.batch([
      d.delete(installments).where(eq(installments.transactionId, id)),
      d.delete(transactions).where(eq(transactions.id, id)),
    ]);
  },
};

export const installmentRepository = {
  findWithTransaction(filters: { month?: string; card?: string }) {
    const conditions: SQL[] = [];
    if (filters.month) conditions.push(eq(installments.dueDate, filters.month));
    if (filters.card) conditions.push(eq(transactions.card, filters.card));
    return getDb().select({
      id: installments.id,
      transactionId: installments.transactionId,
      number: installments.number,
      amount: installments.amount,
      dueDate: installments.dueDate,
      status: installments.status,
      paidAt: installments.paidAt,
      desc: transactions.desc,
      category: transactions.category,
      card: transactions.card,
    }).from(installments)
      .innerJoin(transactions, eq(installments.transactionId, transactions.id))
      .where(and(...conditions));
  },

  getPaidTotalByCard() {
    return getDb()
      .select({
        card: transactions.card,
        paid: sql<number>`sum(${installments.amount})`.as('paid'),
      })
      .from(installments)
      .innerJoin(transactions, eq(installments.transactionId, transactions.id))
      .where(eq(installments.status, 'paid'))
      .groupBy(transactions.card);
  },

  createMany(data: NewInstallment[]) {
    return getDb().insert(installments).values(data).returning();
  },

  create(data: NewInstallment) {
    return getDb().insert(installments).values(data).returning().then(r => r[0]);
  },

  update(id: number, data: Partial<typeof installments.$inferInsert>) {
    return getDb().update(installments).set(data).where(eq(installments.id, id)).returning().then(r => r[0]);
  },

  deleteByTransactionId(transactionId: number) {
    return getDb().delete(installments).where(eq(installments.transactionId, transactionId));
  },
};
