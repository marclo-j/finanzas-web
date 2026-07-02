"use client";

import { useState, useEffect } from "react";
import { Loan, LoanFormData } from "@/lib/types";
import { fmt, fmtDate } from "@/lib/utils";
import { EditIcon, PlusIcon, CheckIcon } from "@/components/ui/Icons";
import LoanModal from "./LoanModal";

export default function LoansView() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Loan | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  async function load() {
    const res = await fetch("/api/loans");
    setLoans(await res.json());
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setModal(true); }
  function openEdit(l: Loan) { setEditing(l); setModal(true); }
  function closeModal() { setModal(false); setEditing(null); }

  async function handleSave(data: LoanFormData) {
    if (editing) {
      await fetch(`/api/loans/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    closeModal();
    load();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/loans/${id}`, { method: "DELETE" });
    closeModal();
    load();
  }

  const pendientes = loans.filter(l => l.status === "pendiente" || l.status === "parcial");
  const totalPendiente = pendientes.reduce((s, l) => s + (l.amount - l.paidAmount), 0);
  const totalGeneral = loans.reduce((s, l) => s + l.amount, 0);

  const S = {
    th: { padding: "10px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 600,
      textTransform: "uppercase" as const, letterSpacing: ".07em", color: "var(--muted)",
      borderBottom: "1px solid var(--border)", background: "var(--bg)" },
    td: { padding: "11px 16px", fontSize: 13, borderBottom: "1px solid var(--border)", verticalAlign: "middle" as const },
  };

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "18px 20px", boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--muted)", marginBottom: 8 }}>Total prestado</div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color: "var(--fg)" }}>{fmt(totalGeneral)}</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "18px 20px", boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--muted)", marginBottom: 8 }}>Pendiente de cobro</div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color: "var(--red)" }}>{fmt(totalPendiente)}</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "18px 20px", boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--muted)", marginBottom: 8 }}>Personas que deben</div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color: "var(--accent)" }}>{pendientes.length}</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Todas las deudas</div>
        <button
          onClick={openNew}
          style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          <PlusIcon /> Nueva deuda
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflowX: "auto", overflowY: "hidden", boxShadow: "var(--shadow)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={S.th}>Persona</th>
              <th style={S.th}>Descripción</th>
              <th style={S.th}>Prestado</th>
              <th style={S.th}>Pagado</th>
              <th style={S.th}>Saldo</th>
              <th style={S.th}>F. préstamo</th>
              <th style={S.th}>F. vencimiento</th>
              <th style={S.th}>Estado</th>
              <th style={S.th} />
            </tr>
          </thead>
          <tbody>
            {loans.map(l => {
              const saldo = l.amount - l.paidAmount;
              const overdue = l.status !== "pagada" && new Date(l.dueDate) < new Date();
              return (
                <tr key={l.id}>
                  <td style={{ ...S.td, fontWeight: 500 }}>{l.person}</td>
                  <td style={{ ...S.td, color: "var(--muted)", fontSize: 12 }}>{l.desc}</td>
                  <td style={{ ...S.td, fontVariantNumeric: "tabular-nums" }}>{fmt(l.amount)}</td>
                  <td style={{ ...S.td, fontVariantNumeric: "tabular-nums" }}>{fmt(l.paidAmount)}</td>
                  <td style={{ ...S.td, fontVariantNumeric: "tabular-nums", fontWeight: 600, color: saldo > 0 ? "var(--red)" : "var(--green)" }}>{fmt(saldo)}</td>
                  <td style={{ ...S.td, fontSize: 12, color: "var(--muted)" }}>{fmtDate(l.lentDate)}</td>
                  <td style={{ ...S.td, fontSize: 12, color: overdue ? "var(--red)" : "var(--muted)", fontWeight: overdue ? 600 : 400 }}>
                    {fmtDate(l.dueDate)}
                    {overdue && " ⚠"}
                  </td>
                  <td style={S.td}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 20,
                      fontSize: 11, fontWeight: 600, gap: 3,
                      background: l.status === "pagada" ? "var(--green-lo)" : l.status === "parcial" ? "var(--accent-lo)" : "var(--red-lo)",
                      color:      l.status === "pagada" ? "var(--green)"    : l.status === "parcial" ? "var(--accent)"    : "var(--red)",
                    }}>
                      {l.status === "pagada" && <CheckIcon />}
                      {l.status === "pagada" ? "Pagada" : l.status === "parcial" ? "Parcial" : "Pendiente"}
                    </span>
                  </td>
                  <td style={{ ...S.td, textAlign: "right" }}>
                    <button onClick={() => openEdit(l)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 5, color: "var(--muted)" }}>
                      <EditIcon />
                    </button>
                  </td>
                </tr>
              );
            })}
            {loans.length === 0 && (
              <tr><td colSpan={9} style={{ ...S.td, textAlign: "center", color: "var(--muted)", padding: 32 }}>Sin deudas registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <LoanModal
        open={modal}
        editing={editing}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
