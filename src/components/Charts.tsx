"use client";

import { useState, useEffect } from "react";
import { fmt, Transaction } from "@/lib/types";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const HIST = [
  { mes: "Ene", ingresos: 24000, egresos: 18000 },
  { mes: "Feb", ingresos: 26500, egresos: 19200 },
  { mes: "Mar", ingresos: 25000, egresos: 17400 },
  { mes: "Abr", ingresos: 30000, egresos: 22000 },
  { mes: "May", ingresos: 27500, egresos: 21300 },
];

const PALETTE = [
  "oklch(58% 0.18 255)","oklch(56% 0.16 155)","oklch(57% 0.19 25)",
  "oklch(72% 0.16 75)","oklch(58% 0.15 300)","oklch(60% 0.14 200)","oklch(55% 0.13 30)",
];

interface Props { transactions: Transaction[] }

export default function Charts({ transactions }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [chartIdx, setChartIdx] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const cats: Record<string, number> = {};
  transactions.filter(t => t.type === "egreso").forEach(t => {
    cats[t.category] = (cats[t.category] || 0) + t.amount;
  });
  const donutData = Object.entries(cats).map(([name, value]) => ({ name, value }));
  const totalEgr = donutData.reduce((s, d) => s + d.value, 0);

  const curIng = transactions.filter(t => t.type === "ingreso").reduce((s, t) => s + t.amount, 0);
  const curEgr = transactions.filter(t => t.type === "egreso" ).reduce((s, t) => s + t.amount, 0);
  const lineData = [...HIST, { mes: "Jun", ingresos: curIng, egresos: curEgr }];

  const tickStyle = { fill: "var(--muted)", fontSize: 11 };

  const lineChart = (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20, boxShadow: "var(--shadow)" }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        Ingresos vs Egresos
        <span style={{ fontSize: 11, fontWeight: 400, color: "var(--muted)" }}>Últimos 6 meses</span>
      </div>
      <ResponsiveContainer width="100%" height={isMobile ? 200 : 240}>
        <LineChart data={lineData}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="0" />
          <XAxis dataKey="mes" tick={tickStyle} axisLine={false} tickLine={false} />
          <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => "$" + v.toLocaleString("es-MX")} width={80} />
          <Tooltip formatter={(v: number) => fmt(v)} />
          <Line type="monotone" dataKey="ingresos" stroke="oklch(56% 0.16 155)" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="egresos"  stroke="oklch(57% 0.19 25)"  strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const donutChart = (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20, boxShadow: "var(--shadow)" }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        Gastos por categoría
        <span style={{ fontSize: 11, fontWeight: 400, color: "var(--muted)" }}>{fmt(totalEgr)}</span>
      </div>
      <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
        <PieChart>
          <Pie data={donutData} dataKey="value" innerRadius="65%" outerRadius="90%" paddingAngle={2}>
            {donutData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />)}
          </Pie>
          <Tooltip formatter={(v: number) => fmt(v)} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
        {donutData.map((d, i) => (
          <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: PALETTE[i % PALETTE.length], flexShrink: 0, display: "inline-block" }} />
              <span>{d.name}</span>
            </span>
            <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--muted)" }}>{fmt(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ marginBottom: 24 }}>
        <div className="carousel-wrap">
          <button
            className="carousel-btn"
            disabled={chartIdx === 0}
            onClick={() => setChartIdx(0)}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="carousel-slide">
            {chartIdx === 0 ? lineChart : donutChart}
          </div>

          <button
            className="carousel-btn"
            disabled={chartIdx === 1}
            onClick={() => setChartIdx(1)}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="carousel-dots">
          {[0, 1].map(i => (
            <button
              key={i}
              className={`carousel-dot${chartIdx === i ? " active" : ""}`}
              onClick={() => setChartIdx(i)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14, marginBottom: 24 }}>
      {lineChart}
      {donutChart}
    </div>
  );
}
