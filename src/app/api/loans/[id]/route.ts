import { db } from "@/db/client";
import { loans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const vals: Record<string, unknown> = {};
  if (body.person !== undefined) vals.person = body.person;
  if (body.desc !== undefined) vals.desc = body.desc;
  if (body.amount !== undefined) vals.amount = parseFloat(body.amount);
  if (body.lentDate !== undefined) vals.lentDate = body.lentDate;
  if (body.dueDate !== undefined) vals.dueDate = body.dueDate;
  if (body.status !== undefined) vals.status = body.status;
  if (body.paidAmount !== undefined) vals.paidAmount = parseFloat(body.paidAmount);

  const [row] = await db.update(loans).set(vals).where(eq(loans.id, Number(id))).returning();
  return NextResponse.json(row);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(loans).where(eq(loans.id, Number(id)));
  return NextResponse.json({ ok: true });
}
