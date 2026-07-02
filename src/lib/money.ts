export function toCentavos(amount: string | number): number {
  return Math.round(typeof amount === "string" ? parseFloat(amount) : amount);
}

export function formatCurrency(centavos: number, currency = "PEN"): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency", currency, minimumFractionDigits: 2,
  }).format(centavos / 100);
}
