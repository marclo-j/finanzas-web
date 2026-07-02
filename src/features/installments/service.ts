import { installmentRepository, transactionRepository } from "@/features/transactions/repository";
import { computeInstallmentDate } from "@/lib/utils";

export const installmentService = {
  async list(month: string | null, card: string | null) {
    const realInstallments = await installmentRepository.findWithTransaction({
      month: month ?? undefined,
      card: card ?? undefined,
    });

    const singles: typeof realInstallments = [];
    if (card) {
      const singleTxns = await transactionRepository.findByCard(card);
      for (const t of singleTxns) {
        const dueDate = computeInstallmentDate(t.date, 1, card);
        if (month && dueDate.slice(0, 7) !== month) continue;
        singles.push({
          id: -(t.id),
          transactionId: t.id,
          number: 1,
          amount: t.amount,
          dueDate,
          status: "pending",
          paidAt: null,
          desc: t.desc,
          category: t.category,
          card: t.card,
        });
      }
    }

    return [...realInstallments, ...singles];
  },

  async create(data: Record<string, unknown>) {
    return installmentRepository.create(data as any);
  },
};
