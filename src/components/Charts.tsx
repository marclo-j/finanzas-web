"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@/lib/types";
import { fmt } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const PALETTE = [
  "oklch(58% 0.18 255)","oklch(56% 0.16 155)","oklch(57% 0.19 25)",
  "oklch(72% 0.16 75)","oklch(58% 0.15 300)","oklch(60% 0.14 200)","oklch(55% 0.13 30)",
];

const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function computeMonthlyData(transactions: Transaction[]) {
  const byMonth: Record<string, { ingresos: number; egresos: number }> = {};
  for (const t of transactions) {
    const m = t.date.slice(0, 7);
    if (!byMonth[m]) byMonth[m] = { ingresos: 0, egresos: 0 };
    if (t.type === "ingreso") byMonth[m].ingresos += t.amount;
    else byMonth[m].egresos += t.amount;
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([m, d]) => ({
      mes: MONTHS[parseInt(m.slice(5, 7), 10) - 1],
      ingresos: Math.round(d.ingresos / 100),
      egresos: Math.round(d.egresos / 100),
    }));
}

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
  const donutData = Object.entries(cats).map(([name, value]) => ({ name, value: Math.round(value / 100) }));
  const totalEgr = donutData.reduce((s, d) => s + d.value, 0);

  const lineData = computeMonthlyData(transactions);

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
