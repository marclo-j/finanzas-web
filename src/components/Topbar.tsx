"use client";

import { MoonIcon, SunIcon } from "./Icons";

interface Props {
  title: string;
  dark: boolean;
  onToggleDark: () => void;
}

export default function Topbar({ title, dark, onToggleDark }: Props) {
  return (
    <header id="topbar" style={{
      background: "var(--surface)", borderBottom: "1px solid var(--border)",
      padding: "0 28px", height: 56,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onToggleDark}
          title="Modo oscuro"
          style={{
            width: 34, height: 34, borderRadius: 8,
            border: "1px solid var(--border)", background: "var(--surface)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--muted)",
          }}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
