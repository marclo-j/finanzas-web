import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class NotFoundError extends Error {
  constructor(msg = "Not found") { super(msg); this.name = "NotFoundError"; }
}

export function handleError(e: unknown): NextResponse {
  if (e instanceof ZodError) {
    return NextResponse.json({
      error: { code: "VALIDATION_ERROR", message: "Datos inválidos", details: e.issues },
    }, { status: 400 });
  }
  if (e instanceof NotFoundError) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: e.message } }, { status: 404 });
  }
  console.error("Unhandled error:", e);
  return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Error interno" } }, { status: 500 });
}
