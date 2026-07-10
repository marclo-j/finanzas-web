import { NextResponse } from "next/server";
import { installmentService } from "@/features/installments/service";
import { handleError } from "@/lib/errors";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.status !== undefined) {
      data.status = body.status;
      data.paidAt = body.status === "paid" ? new Date().toISOString() : null;
    }
    const row = await installmentService.update(Number(id), data);
    return NextResponse.json(row);
  } catch (e) {
    return handleError(e);
  }
}
