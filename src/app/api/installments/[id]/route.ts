import { db } from "@/db/client";
import { installments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const now = new Date().toISOString();

  const vals: Record<string, unknown> = {};
  if (body.status !== undefined) {
    vals.status = body.status;
    vals.paidAt = body.status === "paid" ? now : null;
  }

  const [row] = await db.update(installments).set(vals).where(eq(installments.id, Number(id))).returning();
  return NextResponse.json(row);
}
