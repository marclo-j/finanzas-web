import { useEffect, useState } from "react";
import type { Installment } from "@/lib/types";
import { fmt, fmtDate, fmtMonth } from "@/lib/utils";
import { CalendarIcon } from "@/components/ui/Icons";

interface Props {
  installments: Installment[];
  onToggle?: (inst: Installment, nextStatus: "paid" | "pending") => void;
}

const S = {
  th: { padding: "10px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 600,
    textTransform: "uppercase" as const, letterSpacing: ".07em", color: "var(--muted)",
    borderBottom: "1px solid var(--border)", background: "var(--bg)" },
  td: { padding: "11px 16px", fontSize: 13, borderBottom: "1px solid var(--border)", verticalAlign: "middle" as const },
};

export default function InstallmentList({ installments: initial, onToggle }: Props) {
  const [list, setList] = useState(initial);

  useEffect(() => { setList(initial); }, [initial]);

  async function toggleStatus(inst: Installment) {
    const nextStatus = inst.status === "paid" ? "pending" : "paid";
    const prevStatus = inst.status;

    setList(prev => prev.map(i => i.id === inst.id ? { ...i, status: nextStatus } : i));

    try {
      if (inst.id < 0) {
        const res = await fetch("/api/installments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId: inst.transactionId,
            number: inst.number,
            amount: inst.amount,
            dueDate: inst.dueDate,
            status: nextStatus,
          }),
        });
        if (res.ok) {
          const created = await res.json();
          const merged: Installment = { ...inst, id: created.id, paidAt: created.paidAt, status: nextStatus };
          setList(prev => prev.map(i => i.id === inst.id ? merged : i));
          onToggle?.(merged, nextStatus);
        } else {
          setList(prev => prev.map(i => i.id === inst.id ? { ...i, status: prevStatus } : i));
        }
      } else {
        const res = await fetch(`/api/installments/${inst.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        if (res.ok) {
          onToggle?.(inst, nextStatus);
        } else {
          setList(prev => prev.map(i => i.id === inst.id ? { ...i, status: prevStatus } : i));
        }
      }
    } catch {
      setList(prev => prev.map(i => i.id === inst.id ? { ...i, status: prevStatus } : i));
    }
  }

  if (list.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 32, color: "var(--muted)", fontSize: 13 }}>
        No hay cuotas para esta tarjeta. Agrega una transacción con cuotas desde el historial.
      </div>
    );
  }

  const byMonth: Record<string, Installment[]> = {};
  list.forEach(inst => {
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
        const pendingTotal = insts.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
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
                {fmt(pendingTotal)}
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
                      <select
                        value={inst.status}
                        onChange={() => toggleStatus(inst)}
                        style={{
                          border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px",
                          fontSize: 11, fontWeight: 600, cursor: "pointer",
                          background: inst.status === "paid" ? "var(--green-lo)" : "var(--red-lo)",
                          color: inst.status === "paid" ? "var(--green)" : "var(--red)",
                          outline: "none",
                        }}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="paid">Pagado</option>
                      </select>
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
