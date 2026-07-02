import { getDb } from "@/db/client";
import { transactions, installments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { txnUpdateSchema } from "@/lib/validation";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = txnUpdateSchema.parse(body);
  const vals: Record<string, unknown> = {};
  if (parsed.desc !== undefined) vals.desc = parsed.desc;
  if (parsed.amount !== undefined) vals.amount = Math.round(parseFloat(parsed.amount) * 100);
  if (parsed.type !== undefined) vals.type = parsed.type;
  if (parsed.category !== undefined) vals.category = parsed.category;
  if (parsed.card !== undefined) vals.card = parsed.card;
  if (parsed.date !== undefined) vals.date = parsed.date;

  const [row] = await getDb().update(transactions).set(vals).where(eq(transactions.id, Number(id))).returning();
  return NextResponse.json(row);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await getDb().delete(installments).where(eq(installments.transactionId, Number(id)));
  await getDb().delete(transactions).where(eq(transactions.id, Number(id)));
  return NextResponse.json({ ok: true });
}
