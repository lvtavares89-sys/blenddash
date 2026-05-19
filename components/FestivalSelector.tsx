"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { setFestivalAtual } from "@/actions/eventos";

export interface FestivalOption {
  nome: string;
  placesAtivos: number;
  ultimaData: string | null;
}

export function FestivalSelector({
  festivais,
  selecionado,
}: {
  festivais: FestivalOption[];
  selecionado: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const escolher = (nome: string) => {
    setOpen(false);
    startTransition(async () => {
      await setFestivalAtual(nome);
    });
  };

  const label = selecionado ?? "Nenhum festival";
  const opcaoAtual = festivais.find(f => f.nome === selecionado);

  return (
    <div ref={ref} style={{ position: "relative", padding: "0 12px 16px" }}>
      <p
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "8px",
          fontWeight: 700,
          letterSpacing: "0.25em",
          color: "#2a2a2a",
          textTransform: "uppercase",
          margin: "0 0 6px",
        }}
      >
        Festival
      </p>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={pending || festivais.length === 0}
        style={{
          width: "100%",
          background: "#0f0500",
          border: "1px solid #2a0000",
          borderRadius: "2px",
          padding: "8px 10px",
          cursor: festivais.length === 0 ? "default" : "pointer",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          opacity: pending ? 0.5 : 1,
          transition: "border-color 0.15s",
        }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "11px",
            fontWeight: 700,
            color: "#cc0000",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.2,
          }}
        >
          {label}
        </span>
        {opcaoAtual && (
          <span
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: "9px",
              color: "#3a3a3a",
            }}
          >
            {opcaoAtual.placesAtivos} PDV{opcaoAtual.placesAtivos !== 1 ? "s" : ""} ativo
            {opcaoAtual.placesAtivos !== 1 ? "s" : ""} {open ? "▲" : "▼"}
          </span>
        )}
      </button>

      {open && festivais.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: "12px",
            right: "12px",
            top: "calc(100% - 12px)",
            zIndex: 1000,
            background: "#0a0a0a",
            border: "1px solid #3d0000",
            borderRadius: "2px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
            maxHeight: "320px",
            overflowY: "auto",
          }}
        >
          {festivais.map(f => {
            const ativo = f.nome === selecionado;
            return (
              <button
                key={f.nome}
                onClick={() => escolher(f.nome)}
                style={{
                  width: "100%",
                  background: ativo ? "#1a0000" : "transparent",
                  border: "none",
                  borderBottom: "1px solid #111",
                  padding: "8px 10px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: ativo ? "#cc0000" : "#aaa",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    lineHeight: 1.3,
                  }}
                >
                  {f.nome}
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "9px",
                    color: "#333",
                  }}
                >
                  {f.placesAtivos} PDV{f.placesAtivos !== 1 ? "s" : ""}
                  {f.ultimaData ? ` · ${new Date(f.ultimaData).toLocaleDateString("pt-BR")}` : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
