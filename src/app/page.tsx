import { transactionRepository } from "@/features/transactions/repository";
import type { Transaction } from "@/lib/types";
import Dashboard from "@/features/dashboard/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const rows = await transactionRepository.findAll();
  return <Dashboard initial={rows as Transaction[]} />;
}
