export function toCentavos(amount: string | number): number {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return Math.round(num * 100);
}

export function formatCurrency(centavos: number, currency = "PEN"): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency", currency, minimumFractionDigits: 2,
  }).format(centavos / 100);
}
