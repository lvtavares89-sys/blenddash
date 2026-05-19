"use client";

import { useState } from "react";
import type { CategoriaVenda } from "@/actions/itens";
import { formatBRL } from "@/lib/format";

export function CategoriaAccordion({ categorias }: { categorias: CategoriaVenda[] }) {
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (cat: string) => setOpen(prev => (prev === cat ? null : cat));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {categorias.map((cat, idx) => {
        const isOpen = open === cat.categoria;
        const maxVal = cat.itens[0]?.valorTotal ?? 1;

        return (
          <div
            key={cat.categoria}
            style={{
              border: isOpen ? "1px solid #3d0000" : "1px solid #1a1a1a",
              borderRadius: "2px",
              overflow: "hidden",
              background: isOpen ? "#0f0800" : "#0f0f0f",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            {/* Header button */}
            <button
              onClick={() => toggle(cat.categoria)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                textAlign: "left",
              }}
            >
              {/* Index */}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "9px",
                  color: "#2a2a2a",
                  minWidth: "16px",
                }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>

              {/* Category name */}
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: isOpen ? "#e0e0e0" : "#aaa",
                  textTransform: "uppercase",
                  flex: 1,
                }}
              >
                {cat.categoria}
              </span>

              {/* Qty */}
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "11px",
                  color: "#3a3a3a",
                  whiteSpace: "nowrap",
                }}
              >
                {cat.totalQuantidade.toLocaleString("pt-BR")} un
              </span>

              {/* Items count */}
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "10px",
                  color: "#2a2a2a",
                  background: "#1a1a1a",
                  padding: "2px 6px",
                  borderRadius: "2px",
                  whiteSpace: "nowrap",
                }}
              >
                {cat.itens.length} {cat.itens.length === 1 ? "item" : "itens"}
              </span>

              {/* Total value */}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: isOpen ? "#cc0000" : "#881111",
                  whiteSpace: "nowrap",
                  minWidth: "90px",
                  textAlign: "right",
                }}
              >
                {formatBRL(cat.totalValor)}
              </span>

              {/* Chevron */}
              <span
                style={{
                  color: "#333",
                  fontSize: "10px",
                  transition: "transform 0.2s",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  display: "inline-block",
                  marginLeft: "4px",
                }}
              >
                ▼
              </span>
            </button>

            {/* Expanded items table */}
            {isOpen && (
              <div style={{ borderTop: "1px solid #2a0000" }}>
                {/* Table header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 100px 100px",
                    padding: "6px 16px 6px 44px",
                    background: "#0a0a0a",
                    borderBottom: "1px solid #1a0000",
                  }}
                >
                  {["Produto", "Qtd", "Unit.", "Total"].map((h, i) => (
                    <span
                      key={h}
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "8px",
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        color: "#2a2a2a",
                        textTransform: "uppercase",
                        textAlign: i > 0 ? "right" : "left",
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Rows */}
                {cat.itens.map((item, i) => {
                  const pct = (item.valorTotal / maxVal) * 100;
                  return (
                    <div
                      key={item.sku}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 80px 100px 100px",
                        padding: "9px 16px 9px 44px",
                        borderBottom: i < cat.itens.length - 1 ? "1px solid #111" : "none",
                        background:
                          i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                        position: "relative",
                        alignItems: "center",
                      }}
                    >
                      {/* Bar background */}
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${pct * 0.6}%`,
                          background: "rgba(204,0,0,0.03)",
                          pointerEvents: "none",
                        }}
                      />

                      {/* Nome */}
                      <span
                        style={{
                          fontFamily: "'Barlow', sans-serif",
                          fontSize: "12px",
                          color: "#999",
                          position: "relative",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          paddingRight: "8px",
                        }}
                      >
                        {item.nome}
                      </span>

                      {/* Qty */}
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "11px",
                          color: "#555",
                          textAlign: "right",
                          position: "relative",
                        }}
                      >
                        {item.quantidade.toLocaleString("pt-BR")}
                      </span>

                      {/* Unit price */}
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "11px",
                          color: "#444",
                          textAlign: "right",
                          position: "relative",
                        }}
                      >
                        {formatBRL(item.valorUnitario)}
                      </span>

                      {/* Total */}
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#aa2222",
                          textAlign: "right",
                          position: "relative",
                        }}
                      >
                        {formatBRL(item.valorTotal)}
                      </span>
                    </div>
                  );
                })}

                {/* Category footer */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 100px 100px",
                    padding: "8px 16px 8px 44px",
                    background: "#0a0500",
                    borderTop: "1px solid #2a0000",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      color: "#3a3a3a",
                      textTransform: "uppercase",
                    }}
                  >
                    Total {cat.categoria}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#555",
                      textAlign: "right",
                    }}
                  >
                    {cat.totalQuantidade.toLocaleString("pt-BR")}
                  </span>
                  <span />
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#cc0000",
                      textAlign: "right",
                    }}
                  >
                    {formatBRL(cat.totalValor)}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}