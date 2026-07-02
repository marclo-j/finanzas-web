import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const transactions = sqliteTable("transactions", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  desc:      text("desc").notNull(),
  amount:    integer("amount").notNull(),
  type:      text("type").notNull(),
  category:  text("category").notNull(),
  card:      text("card").notNull(),
  date:      text("date").notNull(),
  installments: integer("installments").notNull().default(1),
  installmentGroupId: text("installment_group_id"),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
}, (table) => ({
  dateIdx:       index("tx_date_idx").on(table.date),
  cardInstIdx:   index("tx_card_inst_idx").on(table.card, table.installments),
}));

export const loans = sqliteTable("loans", {
  id:         integer("id").primaryKey({ autoIncrement: true }),
  person:     text("person").notNull(),
  desc:       text("desc").notNull(),
  amount:     integer("amount").notNull(),
  lentDate:   text("lent_date").notNull(),
  dueDate:    text("due_date").notNull(),
  status:     text("status").notNull().default("pendiente"),
  paidAmount: integer("paid_amount").notNull().default(0),
  createdAt:  text("created_at").default(sql`(datetime('now'))`).notNull(),
}, (table) => ({
  createdAtIdx: index("loans_created_at_idx").on(table.createdAt),
}));

export const installments = sqliteTable("installments", {
  id:            integer("id").primaryKey({ autoIncrement: true }),
  transactionId: integer("transaction_id").notNull().references(() => transactions.id),
  number:        integer("number").notNull(),
  amount:        integer("amount").notNull(),
  dueDate:       text("due_date").notNull(),
  status:        text("status").notNull().default("pending"),
  paidAt:        text("paid_at"),
}, (table) => ({
  txnIdIdx:  index("inst_txn_id_idx").on(table.transactionId),
  dueDateIdx: index("inst_due_date_idx").on(table.dueDate),
}));

export type Transaction    = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Loan           = typeof loans.$inferSelect;
export type NewLoan        = typeof loans.$inferInsert;
export type Installment    = typeof installments.$inferSelect;
export type NewInstallment = typeof installments.$inferInsert;
