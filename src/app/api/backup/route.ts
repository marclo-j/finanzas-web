import { getDb } from "@/db/client";
import { transactions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await getDb().select().from(transactions).orderBy(desc(transactions.date));
  const json = JSON.stringify(rows, null, 2);
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="hyperfinanzas-backup-${date}.json"`,
    },
  });
}
