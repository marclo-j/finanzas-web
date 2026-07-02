import { getDb } from "@/db/client";
import { loans } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const loanRepository = {
  findAll() {
    return getDb().select().from(loans).orderBy(desc(loans.createdAt));
  },

  create(data: typeof loans.$inferInsert) {
    return getDb().insert(loans).values(data).returning().then(r => r[0]);
  },

  update(id: number, data: Partial<typeof loans.$inferInsert>) {
    return getDb().update(loans).set(data).where(eq(loans.id, id)).returning().then(r => r[0]);
  },

  delete(id: number) {
    return getDb().delete(loans).where(eq(loans.id, id));
  },
};
