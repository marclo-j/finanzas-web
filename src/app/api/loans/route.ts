import { getDb } from "@/db/client";
import { loans } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { loanSchema } from "@/lib/validation";

export async function GET() {
  const rows = await getDb().select().from(loans).orderBy(desc(loans.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = loanSchema.parse(body);
  const [row] = await getDb().insert(loans).values({
    person: parsed.person,
    desc: parsed.desc,
    amount: Math.round(parseFloat(parsed.amount) * 100),
    lentDate: parsed.lentDate,
    dueDate: parsed.dueDate,
    paidAmount: parsed.paidAmount ? Math.round(parseFloat(parsed.paidAmount) * 100) : 0,
  }).returning();
  return NextResponse.json(row, { status: 201 });
}
