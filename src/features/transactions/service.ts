import { transactionRepository, installmentRepository } from "./repository";
import { computeInstallmentDate } from "@/lib/utils";
import { toCentavos } from "@/lib/money";
import type { z } from "zod";
import type { txnSchema, txnUpdateSchema } from "@/lib/validation";

type CreateInput = z.infer<typeof txnSchema>;
type UpdateInput = z.infer<typeof txnUpdateSchema>;

export const transactionService = {
  async getAll() {
    return transactionRepository.findAll();
  },

  async create(input: CreateInput) {
    const amountCents = toCentavos(input.amount);

    if (input.installments > 1 && input.type === "egreso") {
      const groupId = crypto.randomUUID();
      const tx = await transactionRepository.create({
        desc: input.desc,
        amount: amountCents,
        type: input.type,
        category: input.category,
        card: input.card,
        date: input.date,
        installments: input.installments,
        installmentGroupId: groupId,
      });

      const perInstallment = Math.floor(amountCents / input.installments);
      const remainder = amountCents - perInstallment * (input.installments - 1);

      const insValues = [];
      for (let i = 1; i <= input.installments; i++) {
        insValues.push({
          transactionId: tx.id,
          number: i,
          amount: i === input.installments ? remainder : perInstallment,
          dueDate: computeInstallmentDate(input.date, i, input.card),
          status: "pending" as const,
        });
      }
      await installmentRepository.createMany(insValues);
      return tx;
    }

    return transactionRepository.create({
      desc: input.desc,
      amount: amountCents,
      type: input.type,
      category: input.category,
      card: input.card,
      date: input.date,
      installments: 1,
    });
  },

  async update(id: number, input: UpdateInput) {
    const vals: Record<string, unknown> = {};
    if (input.desc !== undefined) vals.desc = input.desc;
    if (input.amount !== undefined) vals.amount = toCentavos(input.amount);
    if (input.type !== undefined) vals.type = input.type;
    if (input.category !== undefined) vals.category = input.category;
    if (input.card !== undefined) vals.card = input.card;
    if (input.date !== undefined) vals.date = input.date;

    return transactionRepository.update(id, vals);
  },

  async delete(id: number) {
    await transactionRepository.batchDeleteWithInstallments(id);
    return { ok: true };
  },
};
