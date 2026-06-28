"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, CARDS, Transaction, TxnFormData } from "@/lib/types";

interface Props {
  open: boolean;
  editing: Transaction | null;
  defaultCard?: string;
  onClose: () => void;
  onSave: (data: TxnFormData) => void;
  onDelete: (id: number) => void;
}

export default function TxnModal({ open, editing, defaultCard, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<TxnFormData>({ desc: "", amount: "0", type: "egreso", category: "Alimentación", card: CARDS[0], date: "" });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setForm(editing ? {
      desc: editing.desc, amount: editing.amount, type: editing.type,
      category: editing.category, card: editing.card, date: editing.date,
    } : { desc: "", amount: "0", type: "egreso", category: "Alimentación", card: defaultCard ?? CARDS[0], date: today });
  }, [editing, open, defaultCard]);

  const set = (k: keyof TxnFormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  function submit() {
    if (!form.desc.trim() || Number(form.amount) <= 0) return alert("Completa descripción y monto válido.");
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
          <div style={{ fontSize: 15, fontWeight: 700 }}>{editing ? "Editar transacción" : "Nueva transacción"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 20 }}>×</button>
        </div>

        <Row>
          <Field label="Descripción"><input style={inputStyle} value={form.desc} onChange={e => set("desc", e.target.value)} placeholder="Ej. Supermercado" /></Field>
          <Field label="Monto (PEN)"><input style={inputStyle} type="number" value={form.amount} onChange={e => set("amount", e.target.value)} min="0" step="0.01" /></Field>
        </Row>
        <Row>
          <Field label="Tipo">
            <select style={inputStyle} value={form.type} onChange={e => set("type", e.target.value)}>
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
          </Field>
          <Field label="Categoría">
            <select style={inputStyle} value={form.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </Row>
        <Row>
          <Field label="Tarjeta / cuenta">
            <select style={inputStyle} value={form.card} onChange={e => set("card", e.target.value)}>
              {CARDS.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Fecha"><input style={inputStyle} type="date" value={form.date} onChange={e => set("date", e.target.value)} /></Field>
        </Row>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          {editing && (
            <button
              onClick={() => { if (confirm("¿Eliminar esta transacción?")) onDelete(editing.id); }}
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
