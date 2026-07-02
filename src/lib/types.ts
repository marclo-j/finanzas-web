export type TxnType = "ingreso" | "egreso";
export type LoanStatus = "pendiente" | "pagada" | "parcial";

export interface CardConfig {
  name: string;
  billingDay: number;
  paymentDay: number;
}

export interface Transaction {
  id: number;
  desc: string;
  amount: number;
  type: TxnType;
  category: string;
  card: string;
  date: string;
  installments: number;
  installmentGroupId: string | null;
  createdAt: string;
}

export interface TxnFormData {
  desc: string;
  amount: string;
  type: string;
  category: string;
  card: string;
  date: string;
  installments: number;
}

export interface Loan {
  id: number;
  person: string;
  desc: string;
  amount: number;
  lentDate: string;
  dueDate: string;
  status: LoanStatus;
  paidAmount: number;
  createdAt: string;
}

export interface LoanFormData {
  person: string;
  desc: string;
  amount: string;
  lentDate: string;
  dueDate: string;
  paidAmount: string;
}

export interface Installment {
  id: number;
  transactionId: number;
  number: number;
  amount: number;
  dueDate: string;
  status: "pending" | "paid";
  paidAt: string | null;
  desc?: string;
  category?: string;
  card?: string;
}

export const CATEGORIES = [
  "Alimentación","Transporte","Entretenimiento","Salud",
  "Servicios","Ropa","Sueldo","Freelance","Inversión","Otro",
] as const;

export const DEBIT_CARDS      = ["BCP Débito", "Interbank Débito"] as const;
export const CREDIT_CARDS_CONFIG: CardConfig[] = [
  { name: "IO Crédito",   billingDay: 25, paymentDay: 12 },
  { name: "BBVA Crédito", billingDay: 10, paymentDay: 25 },
];
export const SAVINGS_ACCOUNTS = ["Pichincha", "Cuenta Millonaria - Interbank"] as const;

export const CREDIT_CARD_NAMES = CREDIT_CARDS_CONFIG.map(c => c.name);
export const CARDS = [...DEBIT_CARDS, ...CREDIT_CARD_NAMES, ...SAVINGS_ACCOUNTS] as const;
