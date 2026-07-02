import { z } from "zod";

export const txnSchema = z.object({
  desc: z.string().min(1, "Descripción requerida"),
  amount: z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0, "Monto inválido"),
  type: z.enum(["ingreso", "egreso"]),
  category: z.string().min(1),
  card: z.string().min(1),
  date: z.string().min(1),
  installments: z.coerce.number().int().min(1).default(1),
});

export const txnUpdateSchema = z.object({
  desc: z.string().min(1).optional(),
  amount: z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0).optional(),
  type: z.enum(["ingreso", "egreso"]).optional(),
  category: z.string().min(1).optional(),
  card: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
});

export const loanSchema = z.object({
  person: z.string().min(1, "Persona requerida"),
  desc: z.string().min(1, "Descripción requerida"),
  amount: z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0, "Monto inválido"),
  lentDate: z.string().min(1),
  dueDate: z.string().min(1),
  paidAmount: z.string().optional(),
});

export const loanUpdateSchema = z.object({
  person: z.string().min(1).optional(),
  desc: z.string().min(1).optional(),
  amount: z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0).optional(),
  lentDate: z.string().min(1).optional(),
  dueDate: z.string().min(1).optional(),
  status: z.enum(["pendiente", "pagada", "parcial"]).optional(),
  paidAmount: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0).optional(),
});


