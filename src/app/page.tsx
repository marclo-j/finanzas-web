import { getDb } from "@/db/client";
import { transactions } from "@/db/schema";
import type { Transaction } from "@/lib/types";
import { desc } from "drizzle-orm";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const rows = await getDb().select().from(transactions).orderBy(desc(transactions.date));
  return <Dashboard initial={rows as unknown as Transaction[]} />;
}
