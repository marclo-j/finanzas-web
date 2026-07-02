import { NextResponse } from "next/server";
import { transactionService } from "@/features/transactions/service";
import { txnSchema } from "@/lib/validation";
import { handleError } from "@/lib/errors";

export async function GET() {
  try {
    const rows = await transactionService.getAll();
    return NextResponse.json(rows);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = txnSchema.parse(body);
    const row = await transactionService.create(parsed);
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
