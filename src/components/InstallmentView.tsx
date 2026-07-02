"use client";

import { useState, useEffect } from "react";
import { fmt, fmtDate, fmtMonth, Transaction, Installment, CREDIT_CARDS_CONFIG, getCardConfig } from "@/lib/types";
import { CheckIcon, CalendarIcon } from "./Icons";

interface Props {
  transactions: Transaction[];
  onNew: (defaultCard: string) => void;
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => void;
}

export default function InstallmentView({ transactions }: Props) {
  const [allInstallments, setAllInstallments] = useState<Installment[]>([]);
  const [selectedCard, setSelectedCard] = useState(CREDIT_CARDS_CONFIG[0].name);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  async function load() {
    const res = await fetch(`/api/installments?card=${encodeURIComponent(selectedCard)}`);
    setAllInstallments(await res.json());
  }

  useEffect(() => { load(); }, [selectedCard]);

  async function togglePaid(inst: Installment) {
    const newStatus = inst.status === "paid" ? "pending" : "paid";
    await fetch(`/api/installments/${inst.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  const card = getCardConfig(selectedCard);
  const txns = transactions.filter(t => t.card === selectedCard && t.installments > 1);

  const byMonth: Record<string, Installment[]> = {};
  allInstallments.forEach(inst => {
    const month = inst.dueDate.slice(0, 7);
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(inst);
  });

  const sortedMonths = Object.keys(byMonth).sort();

  const S = {
    th: { padding: "10px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 600,
      textTransform: "uppercase" as const, letterSpacing: ".07em", color: "var(--muted)",
      borderBottom: "1px solid var(--border)", background: "var(--bg)" },
    td: { padding: "11px 16px", fontSize: 13, borderBottom: "1px solid var(--border)", verticalAlign: "middle" as const },
  };

  return (
    <div>
      {/* Card selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {CREDIT_CARDS_CONFIG.map(c => {
          const active = c.name === selectedCard;
          return (
            <button
              key={c.name}
              onClick={() => setSelectedCard(c.name)}
              style={{
                background: active ? "var(--accent)" : "var(--surface)",
                color: active ? "#fff" : "var(--fg)",
                border: active ? "none" : "1px solid var(--border)",
                borderRadius: 10, padding: "10px 16px", cursor: "pointer",
                fontSize: 13, fontWeight: 600, textAlign: "left",
                boxShadow: active ? "var(--shadow)" : "none",
              }}
            >
              <div>{c.name}</div>
              <div style={{ fontSize: 11, fontWeight: 400, marginTop: 3, opacity: 0.7 }}>
                Facturación: día {c.billingDay} | Pago: día {c.paymentDay}
              </div>
            </button>
          );
        })}
      </div>

      {/* Monthly installments */}
      {sortedMonths.length === 0 && (
        <div style={{ textAlign: "center", padding: 32, color: "var(--muted)", fontSize: 13 }}>
          No hay cuotas para esta tarjeta. Agrega una transacción con cuotas desde el historial.
        </div>
      )}

      {sortedMonths.map(month => {
        const insts = byMonth[month];
        const total = insts.reduce((s, i) => s + i.amount, 0);
        const paidCount = insts.filter(i => i.status === "paid").length;
        const allPaid = paidCount === insts.length;

        return (
          <div key={month} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", marginBottom: 16, overflow: "hidden",
            boxShadow: "var(--shadow)",
          }}>
            {/* Month header */}
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

            {/* Installment rows */}
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
                  <tr key={inst.id} style={{ cursor: "pointer" }} onClick={() => togglePaid(inst)}>
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

      {/* Non-installment transactions for this card */}
      {txns.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
          {txns.length} transacción(es) en cuotas activa(s)
        </div>
      )}
    </div>
  );
}
