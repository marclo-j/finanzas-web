import { CREDIT_CARDS_CONFIG } from "./types";

export function fmt(n: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency", currency: "PEN", minimumFractionDigits: 2,
  }).format(n / 100);
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

export function getCardConfig(cardName: string) {
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
