import { db } from "@/db/client";
import { transactions, installments } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { computeInstallmentDate } from "@/lib/types";

export async function GET() {
  const rows = await db.select().from(transactions).orderBy(desc(transactions.date));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const installCount = body.installments ? parseInt(body.installments, 10) : 1;

  if (installCount > 1) {
    const groupId = crypto.randomUUID();
    const [tx] = await db.insert(transactions).values({
      desc: body.desc,
      amount: parseFloat(body.amount),
      type: body.type,
      category: body.category,
      card: body.card,
      date: body.date,
      installments: installCount,
      installmentGroupId: groupId,
    }).returning();

    const perInstallment = parseFloat((parseFloat(body.amount) / installCount).toFixed(2));
    const remainder = parseFloat(body.amount) - perInstallment * (installCount - 1);

    const insValues = [];
    for (let i = 1; i <= installCount; i++) {
      insValues.push({
        transactionId: tx.id,
        number: i,
        amount: i === installCount ? remainder : perInstallment,
        dueDate: computeInstallmentDate(body.date, i, body.card),
        status: "pending" as const,
      });
    }
    await db.insert(installments).values(insValues);

    return NextResponse.json(tx, { status: 201 });
  }

  const [row] = await db.insert(transactions).values({
    desc: body.desc,
    amount: parseFloat(body.amount),
    type: body.type,
    category: body.category,
    card: body.card,
    date: body.date,
    installments: 1,
  }).returning();
  return NextResponse.json(row, { status: 201 });
}
