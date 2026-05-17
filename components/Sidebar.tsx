"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/evento", label: "Evento em Curso", icon: "▶" },
  { href: "/relatorio", label: "Itens Vendidos", icon: "≡" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <nav
      style={{
        width: "180px",
        minWidth: "180px",
        background: "#0a0a0a",
        borderRight: "1px solid #1a0000",
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <div style={{ padding: "0 16px 20px", borderBottom: "1px solid #1a0000", marginBottom: "16px" }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.3em", color: "#cc0000", textTransform: "uppercase" }}>
          Blend BBQ
        </span>
        <br />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", fontWeight: 500, letterSpacing: "0.2em", color: "#2a2a2a", textTransform: "uppercase" }}>
          Dashboard
        </span>
      </div>
      <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV.map(item => {
          const active = path === item.href || path.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                borderRadius: "2px",
                background: active ? "#1a0000" : "transparent",
                border: active ? "1px solid #3d0000" : "1px solid transparent",
                color: active ? "#cc0000" : "#555",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "10px", opacity: 0.8 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}