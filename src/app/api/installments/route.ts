import { db } from "@/db/client";
import { installments, transactions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { computeInstallmentDate } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const month = url.searchParams.get("month");
  const card = url.searchParams.get("card");

  // 1. Multi-installment records
  let query = db.select({
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
    .innerJoin(transactions, eq(installments.transactionId, transactions.id));

  const conditions = [];
  if (month) {
    conditions.push(eq(installments.dueDate, month));
  }
  if (card) {
    conditions.push(eq(transactions.card, card));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  const realInstallments = await query;

  // 2. Single-installment purchases (al contado)
  const singles: typeof realInstallments = [];
  if (card) {
    const singleTxns = await db.select()
      .from(transactions)
      .where(and(eq(transactions.card, card), eq(transactions.installments, 1)));

    for (const t of singleTxns) {
      const dueDate = computeInstallmentDate(t.date, 1, card);
      if (month && dueDate.slice(0, 7) !== month) continue;
      singles.push({
        id: -(t.id),
        transactionId: t.id,
        number: 1,
        amount: t.amount,
        dueDate,
        status: "pending",
        paidAt: null,
        desc: t.desc,
        category: t.category,
        card: t.card,
      });
    }
  }

  return NextResponse.json([...realInstallments, ...singles]);
}

export async function POST(req: Request) {
  const body = await req.json();
  const [row] = await db.insert(installments).values(body).returning();
  return NextResponse.json(row, { status: 201 });
}
