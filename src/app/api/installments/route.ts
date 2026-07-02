import { getDb } from "@/db/client";
import { installments, transactions } from "@/db/schema";
import { eq, and, SQL } from "drizzle-orm";
import { NextResponse } from "next/server";
import { computeInstallmentDate } from "@/lib/utils";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const month = url.searchParams.get("month");
  const card = url.searchParams.get("card");

  const conditions: (SQL | undefined)[] = [];
  if (month) conditions.push(eq(installments.dueDate, month));
  if (card) conditions.push(eq(transactions.card, card));

  const realInstallments = await getDb().select({
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

  // 2. Single-installment purchases (al contado)
  const singles: typeof realInstallments = [];
  if (card) {
    const singleTxns = await getDb().select()
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
  const [row] = await getDb().insert(installments).values(body).returning();
  return NextResponse.json(row, { status: 201 });
}
