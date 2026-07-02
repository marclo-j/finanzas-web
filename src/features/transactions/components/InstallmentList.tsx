import type { Installment } from "@/lib/types";
import { fmt, fmtDate, fmtMonth } from "@/lib/utils";
import { CalendarIcon, CheckIcon } from "@/components/ui/Icons";

interface Props {
  installments: Installment[];
}

const S = {
  th: { padding: "10px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 600,
    textTransform: "uppercase" as const, letterSpacing: ".07em", color: "var(--muted)",
    borderBottom: "1px solid var(--border)", background: "var(--bg)" },
  td: { padding: "11px 16px", fontSize: 13, borderBottom: "1px solid var(--border)", verticalAlign: "middle" as const },
};

export default function InstallmentList({ installments }: Props) {
  if (installments.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 32, color: "var(--muted)", fontSize: 13 }}>
        No hay cuotas para esta tarjeta. Agrega una transacción con cuotas desde el historial.
      </div>
    );
  }

  const byMonth: Record<string, Installment[]> = {};
  installments.forEach(inst => {
    if (!inst.dueDate) return;
    const month = inst.dueDate.slice(0, 7);
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(inst);
  });
  const sortedMonths = Object.keys(byMonth).sort();

  return (
    <div>
      {sortedMonths.map(month => {
        const insts = byMonth[month];
        const total = insts.reduce((s, i) => s + i.amount, 0);
        const paidCount = insts.filter(i => i.status === "paid").length;
        const allPaid = paidCount === insts.length;

        return (
          <div key={month} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", marginBottom: 16, overflowX: "auto", overflowY: "hidden",
            boxShadow: "var(--shadow)",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 20px",
              background: allPaid ? "var(--green-lo)" : "var(--bg)",
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarIcon />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{fmtMonth(month)}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  ({paidCount}/{insts.length} pagadas)
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {fmt(total)}
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={S.th}>#</th>
                  <th style={S.th}>Descripción</th>
                  <th style={S.th}>Categoría</th>
                  <th style={S.th}>Vencimiento</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Monto</th>
                  <th style={S.th}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {insts.map(inst => (
                  <tr key={inst.id} style={{ cursor: "default" }}>
                    <td style={{ ...S.td, color: "var(--muted)", fontSize: 12 }}>{inst.number}/{inst.transactionId}</td>
                    <td style={{ ...S.td, fontWeight: 500 }}>{inst.desc ?? `Transacción #${inst.transactionId}`}</td>
                    <td style={S.td}>
                      {inst.category && (
                        <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 20, fontSize: 11, background: "var(--accent-lo)", color: "var(--accent)" }}>
                          {inst.category}
                        </span>
                      )}
                    </td>
                    <td style={{ ...S.td, fontSize: 12, color: "var(--muted)" }}>{fmtDate(inst.dueDate)}</td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      {fmt(inst.amount)}
                    </td>
                    <td style={S.td}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 20,
                        fontSize: 11, fontWeight: 600, gap: 4,
                        background: inst.status === "paid" ? "var(--green-lo)" : "var(--red-lo)",
                        color:      inst.status === "paid" ? "var(--green)"    : "var(--red)",
                      }}>
                        {inst.status === "paid" && <CheckIcon />}
                        {inst.status === "paid" ? "Pagada" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
