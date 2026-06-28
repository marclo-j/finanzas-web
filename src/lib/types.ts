export type TxnType = "ingreso" | "egreso";

export interface Transaction {
  id: number;
  desc: string;
  amount: string;
  type: TxnType;
  category: string;
  card: string;
  date: string;
  createdAt: string;
}

export interface TxnFormData {
  desc: string;
  amount: string;
  type: string;
  category: string;
  card: string;
  date: string;
}

export const CATEGORIES = [
  "Alimentación","Transporte","Entretenimiento","Salud",
  "Servicios","Ropa","Sueldo","Freelance","Inversión","Otro",
] as const;

export const DEBIT_CARDS      = ["BCP Débito", "Interbank Débito"] as const;
export const CREDIT_CARDS     = ["IO Crédito", "BBVA Crédito"] as const;
export const SAVINGS_ACCOUNTS = ["Pichincha", "Cuenta Millonaria - Interbank"] as const;

export const CARDS = [...DEBIT_CARDS, ...CREDIT_CARDS, ...SAVINGS_ACCOUNTS] as const;

export function fmt(n: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency", currency: "PEN", minimumFractionDigits: 2,
  }).format(n);
}

export function fmtDate(s: string) {
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}
