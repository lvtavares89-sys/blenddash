"use client";

import { useTransition } from "react";
import { togglePlaceAtivo } from "@/actions/eventos";

export function PlaceToggleButton({ placeId, ativo }: { placeId: string; ativo: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => togglePlaceAtivo(placeId))}
      disabled={pending}
      style={{
        background: ativo ? "#1a0000" : "#0a0a0a",
        border: ativo ? "1px solid #3d0000" : "1px solid #1a1a1a",
        borderRadius: "2px",
        padding: "4px 10px",
        cursor: "pointer",
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.2em",
        color: ativo ? "#cc0000" : "#444",
        textTransform: "uppercase",
        opacity: pending ? 0.5 : 1,
        transition: "all 0.15s",
      }}
    >
      {ativo ? "● Ativo" : "○ Inativo"}
    </button>
  );
}
