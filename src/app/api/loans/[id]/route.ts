import { db } from "@/db/client";
import { loans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { loanUpdateSchema } from "@/lib/validation";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = loanUpdateSchema.parse(body);
  const vals: Record<string, unknown> = {};
  if (parsed.person !== undefined) vals.person = parsed.person;
  if (parsed.desc !== undefined) vals.desc = parsed.desc;
  if (parsed.amount !== undefined) vals.amount = Math.round(parseFloat(parsed.amount) * 100);
  if (parsed.lentDate !== undefined) vals.lentDate = parsed.lentDate;
  if (parsed.dueDate !== undefined) vals.dueDate = parsed.dueDate;
  if (parsed.status !== undefined) vals.status = parsed.status;
  if (parsed.paidAmount !== undefined) vals.paidAmount = Math.round(parseFloat(parsed.paidAmount) * 100);

  const [row] = await db.update(loans).set(vals).where(eq(loans.id, Number(id))).returning();
  return NextResponse.json(row);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(loans).where(eq(loans.id, Number(id)));
  return NextResponse.json({ ok: true });
}
