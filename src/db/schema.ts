import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const transactions = sqliteTable("transactions", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  desc:      text("desc").notNull(),
  amount:    real("amount").notNull(),
  type:      text("type").notNull(),
  category:  text("category").notNull(),
  card:      text("card").notNull(),
  date:      text("date").notNull(),
  installments: integer("installments").notNull().default(1),
  installmentGroupId: text("installment_group_id"),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
});

export const loans = sqliteTable("loans", {
  id:         integer("id").primaryKey({ autoIncrement: true }),
  person:     text("person").notNull(),
  desc:       text("desc").notNull(),
  amount:     real("amount").notNull(),
  lentDate:   text("lent_date").notNull(),
  dueDate:    text("due_date").notNull(),
  status:     text("status").notNull().default("pendiente"),
  paidAmount: real("paid_amount").notNull().default(0),
  createdAt:  text("created_at").default(sql`(datetime('now'))`).notNull(),
});

export const installments = sqliteTable("installments", {
  id:            integer("id").primaryKey({ autoIncrement: true }),
  transactionId: integer("transaction_id").notNull().references(() => transactions.id),
  number:        integer("number").notNull(),
  amount:        real("amount").notNull(),
  dueDate:       text("due_date").notNull(),
  status:        text("status").notNull().default("pending"),
  paidAt:        text("paid_at"),
});

export type Transaction    = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Loan           = typeof loans.$inferSelect;
export type NewLoan        = typeof loans.$inferInsert;
export type Installment    = typeof installments.$inferSelect;
export type NewInstallment = typeof installments.$inferInsert;
