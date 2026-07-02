import { NextResponse } from "next/server";
import { loanRepository } from "@/features/loans/repository";
import { loanUpdateSchema } from "@/lib/validation";
import { toCentavos } from "@/lib/money";
import { handleError } from "@/lib/errors";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = loanUpdateSchema.parse(body);
    const vals: Record<string, unknown> = {};
    if (parsed.person !== undefined) vals.person = parsed.person;
    if (parsed.desc !== undefined) vals.desc = parsed.desc;
    if (parsed.amount !== undefined) vals.amount = toCentavos(parsed.amount);
    if (parsed.lentDate !== undefined) vals.lentDate = parsed.lentDate;
    if (parsed.dueDate !== undefined) vals.dueDate = parsed.dueDate;
    if (parsed.status !== undefined) vals.status = parsed.status;
    if (parsed.paidAmount !== undefined) vals.paidAmount = toCentavos(parsed.paidAmount);

    const row = await loanRepository.update(Number(id), vals);
    return NextResponse.json(row);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await loanRepository.delete(Number(id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
