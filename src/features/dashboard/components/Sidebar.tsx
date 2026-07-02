"use client";

import { GridIcon, ListIcon, CardIcon, ClockIcon, PiggyIcon, DebtIcon } from "@/components/ui/Icons";

interface Props {
  view: string;
  onViewChange: (v: string) => void;
}

const ITEMS: { label: string; labelShort: string; v: string; Icon: React.FC }[] = [
  { label: "Resumen",        labelShort: "Res",    v: "dashboard",     Icon: GridIcon },
  { label: "Transacciones",  labelShort: "Trans",  v: "transactions",  Icon: ListIcon },
  { label: "Débito",         labelShort: "Débito", v: "debit",         Icon: CardIcon },
  { label: "Crédito",        labelShort: "Crédito",v: "credit",        Icon: ClockIcon },
  { label: "Ahorro",         labelShort: "Ahorro", v: "savings",       Icon: PiggyIcon },
  { label: "Deudas",         labelShort: "Deudas", v: "debts",         Icon: DebtIcon },
];

export default function Sidebar({ view, onViewChange }: Props) {
  return (
    <>
      {/* DESKTOP */}
      <nav className="sidebar-glass">
        <div className="sidebar-brand">Finanzas personales</div>

        <div className="sidebar-section">General</div>
        {ITEMS.slice(0, 2).map(i => (
          <button
            key={i.v}
            onClick={() => onViewChange(i.v)}
            className={`nav-item-glass${view === i.v ? " active" : ""}`}
          >
            <i.Icon />
            {i.label}
          </button>
        ))}

        <div className="sidebar-section">Cuentas</div>
        {ITEMS.slice(2).map(i => (
          <button
            key={i.v}
            onClick={() => onViewChange(i.v)}
            className={`nav-item-glass${view === i.v ? " active" : ""}`}
          >
            <i.Icon />
            {i.label}
          </button>
        ))}
      </nav>

      {/* MOBILE */}
      <nav className="bottom-nav">
        {ITEMS.map(i => (
          <button
            key={i.v}
            onClick={() => onViewChange(i.v)}
            className={`nav-item-bottom${view === i.v ? " active" : ""}`}
          >
            <i.Icon />
            <span>{i.labelShort}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
