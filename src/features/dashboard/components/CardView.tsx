"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Transaction, Installment } from "@/lib/types";
import { fmt, getCardConfig } from "@/lib/utils";
import TxnTable from "@/features/transactions/components/TxnTable";
import InstallmentList from "@/features/transactions/components/InstallmentList";
import { PlusIcon } from "@/components/ui/Icons";

interface Props {
  cards: readonly string[];
  transactions: Transaction[];
  initialPaidTotals?: Record<string, number>;
  onNew: (defaultCard: string) => void;
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => void;
  isCredit?: boolean;
}

const CARD_CONFIG: Record<string, {
  logo: string;
  bg: string;
  glow: string;
  logoSize: number;
  logoBg?: string;
  textColor?: string;
  fixedBalance?: number;
}> = {
  "BCP Débito": {
    logo: "/BCP.jpg",
    bg: "linear-gradient(135deg, #0d2fa3 0%, #1a4fcf 50%, #e84c1e 100%)",
    glow: "rgba(13,47,163,.45)",
    logoSize: 52,
  },
  "Interbank Débito": {
    logo: "/INTERBANK.svg",
    bg: "linear-gradient(135deg, #00853e 0%, #00b359 60%, #006e34 100%)",
    glow: "rgba(0,133,62,.45)",
    logoSize: 52,
  },
  "IO Crédito": {
    logo: "/io.png",
    bg: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
    glow: "rgba(64,158,187,.45)",
    logoSize: 48,
    logoBg: "transparent",
    fixedBalance: 70000,
  },
  "BBVA Crédito": {
    logo: "/BBVA.jpg",
    bg: "linear-gradient(135deg, #00438f 0%, #0b4fbf 55%, #003b7a 100%)",
    glow: "rgba(0,67,143,.45)",
    logoSize: 52,
    fixedBalance: 50000,
  },
  "Pichincha": {
    logo: "/pichincha.png",
    bg: "linear-gradient(135deg, #f5c800 0%, #ffd700 50%, #e6b800 100%)",
    glow: "rgba(245,200,0,.45)",
    logoSize: 52,
    logoBg: "transparent",
    textColor: "#1B2D55",
    fixedBalance: 54406,
  },
  "Efectibank": {
    logo: "/efectibank.webp",
    bg: "linear-gradient(135deg, #020A10 0%, #216EF9 60%, #020A10 100%)",
    glow: "rgba(33,110,249,.45)",
    logoSize: 52,
    fixedBalance: 1554348,
  },
};

export default function CardView({ cards, transactions, initialPaidTotals, onNew, onEdit, onDelete, isCredit }: Props) {
  const [selected, setSelected] = useState(cards[0]);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileIdx, setMobileIdx] = useState(0);
  const [tab, setTab] = useState<"historial" | "cuotas">("historial");
  const [allInstallments, setAllInstallments] = useState<Installment[]>([]);
  const [paidTotals, setPaidTotals] = useState<Record<string, number>>(initialPaidTotals ?? {});

  function handleInstallmentToggle(inst: Installment, nextStatus: "paid" | "pending") {
    const card = inst.card ?? selected;
    const diff = nextStatus === "paid" ? inst.amount : -inst.amount;
    setPaidTotals(prev => ({ ...prev, [card]: (prev[card] ?? 0) + diff }));
  }
  const filtered = transactions.filter(t => t.card === selected);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    setMobileIdx(0);
  }, [cards]);

  useEffect(() => {
    if (tab === "cuotas") {
      fetch(`/api/installments?card=${encodeURIComponent(selected)}`)
        .then(r => r.json())
        .then(setAllInstallments)
        .catch(() => {});
    }
  }, [tab, selected]);

  function renderCard(card: string, isActive: boolean) {
    const cfg = CARD_CONFIG[card];
    const txns  = transactions.filter(t => t.card === card);
    const ing   = txns.filter(t => t.type === "ingreso").reduce((s, t) => s + t.amount, 0);
    const egr   = txns.filter(t => t.type === "egreso" ).reduce((s, t) => s + t.amount, 0);
    const saldo = (cfg?.fixedBalance ?? 0) + ing - egr + (paidTotals[card] ?? 0);
    const tc = cfg?.textColor;
    const toRgba = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${a})`;
    const ccCfg = isCredit ? getCardConfig(card) : undefined;

    return (
      <button
        key={card}
        onClick={() => setSelected(card)}
        style={{
          position: "relative",
          background: cfg?.bg ?? "var(--surface)",
          borderRadius: 20,
          padding: isMobile ? "20px 20px 16px" : "24px 24px 20px",
          border: isActive
            ? `2px solid rgba(255,255,255,.35)`
            : "2px solid rgba(255,255,255,.10)",
          cursor: "pointer",
          textAlign: "left",
          overflow: "hidden",
          boxShadow: isActive
            ? `0 8px 32px ${cfg?.glow ?? "rgba(0,0,0,.3)"}, 0 2px 8px rgba(0,0,0,.2)`
            : "0 4px 16px rgba(0,0,0,.15)",
          transform: isActive ? "translateY(-3px)" : "none",
          transition: "transform .2s, box-shadow .2s, border-color .2s",
          width: "100%",
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,.04) 50%, rgba(255,255,255,.10) 100%)",
          backdropFilter: "blur(1px)",
          pointerEvents: "none",
        }} />

        <div style={{
          position: "absolute", bottom: -30, right: -30,
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(255,255,255,.08)",
          filter: "blur(24px)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, position: "relative" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: tc ? toRgba(tc,.65) : "rgba(255,255,255,.65)", marginBottom: 4 }}>
              {card.includes("Débito") ? "Débito" : card.includes("Crédito") ? "Crédito" : "Ahorro"}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: tc ? toRgba(tc,.9) : "rgba(255,255,255,.9)" }}>
              {card.replace(" Débito","").replace(" Crédito","").replace(" - Interbank","")}
            </div>
            {ccCfg && (
              <div style={{ fontSize: 9, marginTop: 4, color: tc ? toRgba(tc,.55) : "rgba(255,255,255,.55)", letterSpacing: ".02em" }}>
                Fact. día {ccCfg.billingDay} · Pago día {ccCfg.paymentDay}
              </div>
            )}
          </div>
          {cfg && (
            <div style={{
              width: cfg.logoSize, height: cfg.logoSize,
              borderRadius: 12,
              overflow: "hidden",
              background: cfg.logoBg ?? (tc ? toRgba(tc,.12) : "rgba(255,255,255,.12)"),
              backdropFilter: "blur(8px)",
              border: tc ? `1px solid ${toRgba(tc,.2)}` : "1px solid rgba(255,255,255,.2)",
              flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Image
                src={cfg.logo}
                alt={card}
                width={cfg.logoSize}
                height={cfg.logoSize}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
          )}
        </div>

        <div style={{ position: "relative", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: tc ? toRgba(tc,.55) : "rgba(255,255,255,.55)", marginBottom: 4 }}>Saldo disponible</div>
          <div style={{
            fontSize: isMobile ? 24 : 28, fontWeight: 700, letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums", color: tc ?? "#fff",
            textShadow: "0 2px 8px rgba(0,0,0,.2)",
          }}>
            {fmt(saldo)}
          </div>
        </div>

        <div style={{
          display: "flex", gap: 12, position: "relative",
          borderTop: tc ? `1px solid ${toRgba(tc,.12)}` : "1px solid rgba(255,255,255,.12)", paddingTop: 12,
        }}>
          <div>
            <div style={{ fontSize: 11, color: tc ? toRgba(tc,.5) : "rgba(255,255,255,.5)", marginBottom: 2 }}>Ingresos</div>
            <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, color: tc ? toRgba(tc,.8) : "rgba(180,255,200,.9)", fontVariantNumeric: "tabular-nums" }}>
              +{fmt(ing)}
            </div>
          </div>
          <div style={{ width: 1, background: tc ? toRgba(tc,.12) : "rgba(255,255,255,.12)" }} />
          <div>
            <div style={{ fontSize: 11, color: tc ? toRgba(tc,.5) : "rgba(255,255,255,.5)", marginBottom: 2 }}>Egresos</div>
            <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, color: tc ? toRgba(tc,.8) : "rgba(255,180,180,.9)", fontVariantNumeric: "tabular-nums" }}>
              -{fmt(egr)}
            </div>
          </div>
        </div>

        {isActive && !isMobile && (
          <div style={{
            position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: 40, height: 3, borderRadius: "3px 3px 0 0",
            background: "rgba(255,255,255,.7)",
          }} />
        )}
      </button>
    );
  }

  return (
    <div>
      {/* Cards */}
      {isMobile ? (
        <div style={{ marginBottom: 24 }}>
          <div className="carousel-wrap">
            <button
              className="carousel-btn"
              disabled={mobileIdx === 0}
              onClick={() => setMobileIdx(i => Math.max(0, i - 1))}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="carousel-slide">
              {renderCard(cards[mobileIdx], true)}
            </div>

            <button
              className="carousel-btn"
              disabled={mobileIdx === cards.length - 1}
              onClick={() => setMobileIdx(i => Math.min(cards.length - 1, i + 1))}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="carousel-dots">
            {cards.map((_, i) => (
              <button
                key={i}
                className={`carousel-dot${mobileIdx === i ? " active" : ""}`}
                onClick={() => setMobileIdx(i)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cards.length}, 1fr)`,
          gap: 20,
          marginBottom: 32,
        }}>
          {cards.map(card => renderCard(card, selected === card))}
        </div>
      )}

      {/* Tabs + Actions */}
      {isMobile ? (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            {isCredit ? (
              <div style={{ display: "flex", gap: 4, background: "var(--bg)", borderRadius: 8, padding: 3, border: "1px solid var(--border)" }}>
                <button
                  onClick={() => setTab("historial")}
                  style={{
                    background: tab === "historial" ? "var(--accent)" : "transparent",
                    color: tab === "historial" ? "#fff" : "var(--muted)",
                    border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}
                >Historial</button>
                <button
                  onClick={() => setTab("cuotas")}
                  style={{
                    background: tab === "cuotas" ? "var(--accent)" : "transparent",
                    color: tab === "cuotas" ? "#fff" : "var(--muted)",
                    border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}
                >Cuotas</button>
              </div>
            ) : (
              <span style={{ fontSize: 14, fontWeight: 600 }}>Historial</span>
            )}
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 13, background: "var(--bg)", color: "var(--fg)", cursor: "pointer" }}
            >
              {cards.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={() => onNew(selected)}
            style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <PlusIcon /> Nueva transacción
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isCredit ? (
              <div style={{ display: "flex", gap: 4, background: "var(--bg)", borderRadius: 8, padding: 3, border: "1px solid var(--border)" }}>
                <button
                  onClick={() => setTab("historial")}
                  style={{
                    background: tab === "historial" ? "var(--accent)" : "transparent",
                    color: tab === "historial" ? "#fff" : "var(--muted)",
                    border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}
                >Historial</button>
                <button
                  onClick={() => setTab("cuotas")}
                  style={{
                    background: tab === "cuotas" ? "var(--accent)" : "transparent",
                    color: tab === "cuotas" ? "#fff" : "var(--muted)",
                    border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}
                >Cuotas</button>
              </div>
            ) : (
              <span style={{ fontSize: 14, fontWeight: 600 }}>Historial</span>
            )}
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 13, background: "var(--bg)", color: "var(--fg)", cursor: "pointer" }}
            >
              {cards.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={() => onNew(selected)}
            style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <PlusIcon /> Nueva transacción
          </button>
        </div>
      )}

      {/* Content */}
      {tab === "historial" || !isCredit ? (
        <TxnTable transactions={filtered} onEdit={onEdit} onDelete={onDelete} />
      ) : (
        <InstallmentList installments={allInstallments} onToggle={handleInstallmentToggle} />
      )}
    </div>
  );
}
