"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@/lib/types";
import { fmt } from "@/lib/utils";

interface Props { transactions: Transaction[] }

export default function KpiGrid({ transactions }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const ing  = transactions.filter(t => t.type === "ingreso").reduce((s, t) => s + t.amount, 0);
  const egr  = transactions.filter(t => t.type === "egreso" ).reduce((s, t) => s + t.amount, 0);
  const saldo = ing - egr;

  const cards = [
    { label: "Saldo disponible", value: fmt(saldo), color: "var(--accent)", bar: "var(--accent)" },
    { label: "Ingresos",          value: fmt(ing),   color: "var(--green)",  bar: "var(--green)"  },
    { label: "Egresos",           value: fmt(egr),   color: "var(--red)",    bar: "var(--red)"    },
  ];

  function cardEl(c: typeof cards[0], compact?: boolean) {
    return (
      <div key={c.label} style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: compact ? "14px 16px" : "18px 20px",
        boxShadow: "var(--shadow)",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--muted)", marginBottom: 8 }}>
          {c.label}
        </div>
        <div style={{ fontSize: compact ? 20 : 24, fontWeight: 700, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", lineHeight: 1, color: c.color }}>
          {c.value}
        </div>
        <div style={{ height: 3, borderRadius: 2, marginTop: compact ? 10 : 14, background: c.bar, opacity: .35 }} />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div style={{ marginBottom: 24 }}>
        {cardEl(cards[0], true)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          {cardEl(cards[1], true)}
          {cardEl(cards[2], true)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
      {cards.map(c => cardEl(c))}
    </div>
  );
}
