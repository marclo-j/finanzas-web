import { NextResponse } from "next/server";
import { transactionService } from "@/features/transactions/service";
import { txnUpdateSchema } from "@/lib/validation";
import { handleError } from "@/lib/errors";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = txnUpdateSchema.parse(body);
    const row = await transactionService.update(Number(id), parsed);
    return NextResponse.json(row);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await transactionService.delete(Number(id));
    return NextResponse.json(result);
  } catch (e) {
    return handleError(e);
  }
}
