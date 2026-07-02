"use client";

import { useEffect, useState } from "react";
import { Loan, LoanFormData } from "@/lib/types";

interface Props {
  open: boolean;
  editing: Loan | null;
  onClose: () => void;
  onSave: (data: LoanFormData) => void;
  onDelete: (id: number) => void;
}

export default function LoanModal({ open, editing, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<LoanFormData>({
    person: "", desc: "", amount: "0", lentDate: "", dueDate: "", paidAmount: "0",
  });

  useEffect(() => {
    if (editing) {
      setForm({
        person: editing.person,
        desc: editing.desc,
        amount: String(editing.amount),
        lentDate: editing.lentDate,
        dueDate: editing.dueDate,
        paidAmount: String(editing.paidAmount),
      });
    } else {
      const today = new Date().toISOString().split("T")[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const due = nextMonth.toISOString().split("T")[0];
      setForm({ person: "", desc: "", amount: "0", lentDate: today, dueDate: due, paidAmount: "0" });
    }
  }, [editing, open]);

  const set = (k: keyof LoanFormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  function submit() {
    if (!form.person.trim() || !form.desc.trim() || Number(form.amount) <= 0) {
      return alert("Completa persona, descripción y monto válido.");
    }
    onSave(form);
  }

  const inputStyle = {
    border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px",
    fontSize: 13, background: "var(--bg)", color: "var(--fg)", outline: "none", width: "100%",
  };

  if (!open) return null;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "oklch(0% 0 0 / .45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      }}
    >
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: 28, width: 460, maxWidth: "95vw",
        boxShadow: "0 8px 32px oklch(0% 0 0 / .18)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            {editing ? "Editar deuda" : "Nueva deuda"}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 20 }}>×</button>
        </div>

        <Row>
          <Field label="Persona"><input style={inputStyle} value={form.person} onChange={e => set("person", e.target.value)} placeholder="¿Quién debe?" /></Field>
          <Field label="Monto (PEN)"><input style={inputStyle} type="number" value={form.amount} onChange={e => set("amount", e.target.value)} min="0" step="0.01" /></Field>
        </Row>
        <Row>
          <Field label="Descripción"><input style={inputStyle} value={form.desc} onChange={e => set("desc", e.target.value)} placeholder="Ej. Préstamo para.." /></Field>
        </Row>
        <Row>
          <Field label="Fecha del préstamo"><input style={inputStyle} type="date" value={form.lentDate} onChange={e => set("lentDate", e.target.value)} /></Field>
          <Field label="Fecha de vencimiento"><input style={inputStyle} type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} /></Field>
        </Row>
        <Row>
          <Field label="Monto pagado">
            <input style={inputStyle} type="number" value={form.paidAmount} onChange={e => set("paidAmount", e.target.value)} min="0" step="0.01" />
          </Field>
          <div />
        </Row>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          {editing && (
            <button
              onClick={() => { if (confirm("¿Eliminar esta deuda?")) onDelete(editing.id); }}
              style={{ background: "var(--red)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Eliminar
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", color: "var(--fg)" }}>
            Cancelar
          </button>
          <button onClick={submit} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{label}</label>
      {children}
    </div>
  );
}
