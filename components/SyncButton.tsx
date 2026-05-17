"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SyncButtonProps {
  lastSync: { executadoEm: Date; sucesso: boolean } | null;
}

export function SyncButton({ lastSync }: SyncButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/sync?token=${process.env.NEXT_PUBLIC_ZIG_SYNC_TOKEN ?? "zig-sync-blend-2026"}`
      );
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao sincronizar");
    } finally {
      setLoading(false);
    }
  }

  const ts = lastSync?.executadoEm
    ? new Date(lastSync.executadoEm).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      })
    : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      {ts && (
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "11px",
            color: lastSync?.sucesso ? "#3a3a3a" : "#8b0000",
            letterSpacing: "0.1em",
          }}
        >
          sync {ts}
        </span>
      )}
      {error && (
        <span style={{ fontSize: "10px", color: "#cc0000", fontFamily: "'JetBrains Mono'" }}>
          {error}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 14px",
          background: loading ? "#1a0000" : "transparent",
          border: "1px solid #3d0000",
          borderRadius: "2px",
          color: loading ? "#8b0000" : "#cc0000",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            (e.target as HTMLButtonElement).style.background = "#1a0000";
            (e.target as HTMLButtonElement).style.borderColor = "#cc0000";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            (e.target as HTMLButtonElement).style.background = "transparent";
            (e.target as HTMLButtonElement).style.borderColor = "#3d0000";
          }
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            animation: loading ? "spin 1s linear infinite" : "none",
          }}
        >
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        {loading ? "Sincronizando..." : "Sincronizar"}
      </button>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}