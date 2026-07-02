import { db } from "@/db/client";
import { loans } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db.select().from(loans).orderBy(desc(loans.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const [row] = await db.insert(loans).values({
    person: body.person,
    desc: body.desc,
    amount: parseFloat(body.amount),
    lentDate: body.lentDate,
    dueDate: body.dueDate,
    paidAmount: body.paidAmount ? parseFloat(body.paidAmount) : 0,
  }).returning();
  return NextResponse.json(row, { status: 201 });
}
