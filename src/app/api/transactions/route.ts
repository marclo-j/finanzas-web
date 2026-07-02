import { getDb } from "@/db/client";
import { transactions, installments } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { computeInstallmentDate } from "@/lib/utils";
import { txnSchema } from "@/lib/validation";

export async function GET() {
  const rows = await getDb().select().from(transactions).orderBy(desc(transactions.date));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = txnSchema.parse(body);
  const amountCents = Math.round(parseFloat(parsed.amount) * 100);

  if (parsed.installments > 1) {
    const groupId = crypto.randomUUID();
    const [tx] = await getDb().insert(transactions).values({
      desc: parsed.desc,
      amount: amountCents,
      type: parsed.type,
      category: parsed.category,
      card: parsed.card,
      date: parsed.date,
      installments: parsed.installments,
      installmentGroupId: groupId,
    }).returning();

    const perInstallment = Math.floor(amountCents / parsed.installments);
    const remainder = amountCents - perInstallment * (parsed.installments - 1);

    const insValues = [];
    for (let i = 1; i <= parsed.installments; i++) {
      insValues.push({
        transactionId: tx.id,
        number: i,
        amount: i === parsed.installments ? remainder : perInstallment,
        dueDate: computeInstallmentDate(parsed.date, i, parsed.card),
        status: "pending" as const,
      });
    }
    await getDb().insert(installments).values(insValues);

    return NextResponse.json(tx, { status: 201 });
  }

  const [row] = await getDb().insert(transactions).values({
    desc: parsed.desc,
    amount: amountCents,
    type: parsed.type,
    category: parsed.category,
    card: parsed.card,
    date: parsed.date,
    installments: 1,
  }).returning();
  return NextResponse.json(row, { status: 201 });
}
