import { Transaction } from "@/lib/types";
import { fmt, fmtDate } from "@/lib/utils";
import { EditIcon, TrashIcon } from "@/components/ui/Icons";

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => void;
}

export default function TxnTable({ transactions, onEdit, onDelete }: Props) {
  const S = {
    th: { padding: "10px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 600,
      textTransform: "uppercase" as const, letterSpacing: ".07em", color: "var(--muted)",
      borderBottom: "1px solid var(--border)", background: "var(--bg)" },
    td: { padding: "11px 16px", fontSize: 13, borderBottom: "1px solid var(--border)", verticalAlign: "middle" as const },
  };

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflowX: "auto", overflowY: "hidden", boxShadow: "var(--shadow)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={S.th}>Fecha</th>
            <th style={S.th}>Descripción</th>
            <th style={S.th}>Categoría</th>
            <th style={S.th}>Tipo</th>
            <th style={S.th}>Tarjeta</th>
            <th style={{ ...S.th, textAlign: "right" }}>Monto</th>
            <th style={S.th} />
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id} style={{ cursor: "default" }}>
              <td style={{ ...S.td, color: "var(--muted)", fontSize: 12 }}>{fmtDate(t.date)}</td>
              <td style={{ ...S.td, fontWeight: 500 }}>{t.desc}</td>
              <td style={S.td}>
                <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 20, fontSize: 11, background: "var(--accent-lo)", color: "var(--accent)" }}>
                  {t.category}
                </span>
              </td>
              <td style={S.td}>
                <span style={{
                  display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 20,
                  fontSize: 11, fontWeight: 600,
                  background: t.type === "ingreso" ? "var(--green-lo)" : "var(--red-lo)",
                  color:      t.type === "ingreso" ? "var(--green)"    : "var(--red)",
                }}>
                  {t.type === "ingreso" ? "Ingreso" : "Egreso"}
                </span>
              </td>
              <td style={{ ...S.td, color: "var(--muted)", fontSize: 12 }}>{t.card}</td>
              <td style={{ ...S.td, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: t.type === "ingreso" ? "var(--green)" : "var(--red)" }}>
                {t.type === "ingreso" ? "+" : "-"}{fmt(t.amount)}
              </td>
              <td style={{ ...S.td, textAlign: "right" }}>
                <button onClick={() => onEdit(t)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 5, color: "var(--muted)" }}>
                  <EditIcon />
                </button>
                <button onClick={() => onDelete(t.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 5, color: "var(--muted)" }}>
                  <TrashIcon />
                </button>
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", color: "var(--muted)", padding: 32 }}>Sin transacciones</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
