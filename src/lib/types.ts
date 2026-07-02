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

export function fmt(n: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency", currency: "PEN", minimumFractionDigits: 2,
  }).format(n);
}

export function fmtDate(s: string) {
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

export function fmtMonth(s: string) {
  const [y, m] = s.split("-");
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${months[parseInt(m, 10) - 1]} ${y}`;
}

export function getCardConfig(cardName: string): CardConfig | undefined {
  return CREDIT_CARDS_CONFIG.find(c => c.name === cardName);
}

export function computeInstallmentDate(purchaseDate: string, installmentNumber: number, cardName: string): string {
  const card = getCardConfig(cardName);
  const paymentDay = card ? card.paymentDay : 28;
  const d = new Date(purchaseDate);
  const month = d.getMonth() + installmentNumber;
  const year = d.getFullYear() + Math.floor(month / 12);
  const m = (month % 12) + 1;
  const day = Math.min(paymentDay, new Date(year, m, 0).getDate());
  return `${year}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function computeBillingMonth(purchaseDate: string, cardName: string): string {
  const card = getCardConfig(cardName);
  if (!card) {
    const d = new Date(purchaseDate);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  const d = new Date(purchaseDate);
  if (d.getDate() > card.billingDay) {
    d.setMonth(d.getMonth() + 1);
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
