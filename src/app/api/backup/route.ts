import { NextResponse } from "next/server";
import { transactionRepository } from "@/features/transactions/repository";
import { handleError } from "@/lib/errors";

export async function GET() {
  try {
    const rows = await transactionRepository.findAll();
    const json = JSON.stringify(rows, null, 2);
    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="hyperfinanzas-backup-${date}.json"`,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
