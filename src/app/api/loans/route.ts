import { NextResponse } from "next/server";
import { loanRepository } from "@/features/loans/repository";
import { loanSchema } from "@/lib/validation";
import { toCentavos } from "@/lib/money";
import { handleError } from "@/lib/errors";

export async function GET() {
  try {
    const rows = await loanRepository.findAll();
    return NextResponse.json(rows);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loanSchema.parse(body);
    const row = await loanRepository.create({
      person: parsed.person,
      desc: parsed.desc,
      amount: toCentavos(parsed.amount),
      lentDate: parsed.lentDate,
      dueDate: parsed.dueDate,
      paidAmount: parsed.paidAmount ? toCentavos(parsed.paidAmount) : 0,
    });
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
