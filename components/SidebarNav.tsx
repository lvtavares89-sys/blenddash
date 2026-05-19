"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/evento", label: "Evento em Curso", icon: "▶" },
  { href: "/relatorio", label: "Itens Vendidos", icon: "≡" },
  { href: "/admin/festivais", label: "Festivais", icon: "⚙" },
];

export function SidebarNav() {
  const path = usePathname();
  return (
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
  );
}
