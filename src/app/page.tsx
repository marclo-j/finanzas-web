import { transactionRepository, installmentRepository } from "@/features/transactions/repository";
import type { Transaction } from "@/lib/types";
import Dashboard from "@/features/dashboard/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const rows = await transactionRepository.findAll();
  const paidTotalsArr = await installmentRepository.getPaidTotalByCard();
  const initialPaidTotals: Record<string, number> = {};
  for (const r of paidTotalsArr) initialPaidTotals[r.card] = r.paid;
  return <Dashboard initial={rows as Transaction[]} initialPaidTotals={initialPaidTotals} />;
}
