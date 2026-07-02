import { NextResponse } from "next/server";
import { installmentService } from "@/features/installments/service";
import { handleError } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const month = url.searchParams.get("month");
    const card = url.searchParams.get("card");
    const rows = await installmentService.list(month, card);
    return NextResponse.json(rows);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const row = await installmentService.create(body);
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
