import {
  buscarEventosEmCurso,
  buscarKpisEvento,
  buscarUltimoSync,
} from "@/actions/eventos";
import { KpiCard } from "@/components/KpiCard";
import { DiaCard } from "@/components/DiaCard";
import { SyncButton } from "@/components/SyncButton";
import { LiveBadge } from "@/components/LiveBadge";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EventoPage() {
  const [dias, kpis, ultimoSync] = await Promise.all([
    buscarEventosEmCurso().catch(() => []),
    buscarKpisEvento().catch(() => ({
      totalVendas: 0,
      totalRecebimentos: 0,
      totalClientes: 0,
      ticketMedio: 0,
      eventosAbertos: 0,
      eventosTotais: 0,
    })),
    buscarUltimoSync().catch(() => null),
  ]);

  const temDados = dias.length > 0;
  const temAoVivo = kpis.eventosAbertos > 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        padding: "0",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          borderBottom: "1px solid #1a0000",
          padding: "0 32px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#080808",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.3em",
              color: "#cc0000",
              textTransform: "uppercase",
            }}
          >
            Blend BBQ
          </span>
          <span
            style={{
              width: "1px",
              height: "14px",
              background: "#2a0000",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.2em",
              color: "#3a3a3a",
              textTransform: "uppercase",
            }}
          >
            Dashboard
          </span>
        </div>
        <SyncButton lastSync={ultimoSync} />
      </div>

      <div style={{ padding: "32px" }}>
        {/* Event header */}
        <div
          style={{ marginBottom: "32px" }}
          className="animate-fade-in"
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.25em",
                  color: "#3a3a3a",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                Evento em Curso
              </p>
              <h1
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "clamp(20px, 3vw, 32px)",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  color: "#e0e0e0",
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                Blend BBQ Festival Nova Iguaçu 2026
              </h1>
              <p
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "12px",
                  color: "#3a3a3a",
                  marginTop: "6px",
                }}
              >
                PDV 1 + PDV 2 — dados unificados
              </p>
            </div>
            {temAoVivo && <LiveBadge />}
          </div>
          <hr className="divider-red" style={{ marginTop: "20px" }} />
        </div>

        {temDados ? (
          <>
            {/* KPI Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1px",
                background: "#1a0000",
                border: "1px solid #1a0000",
                borderRadius: "2px",
                marginBottom: "32px",
                overflow: "hidden",
              }}
            >
              <KpiCard
                label="Vendas Totais"
                value={formatBRL(kpis.totalVendas)}
                sub="ambos os PDVs"
                accent
              />
              <KpiCard
                label="Recebimentos"
                value={formatBRL(kpis.totalRecebimentos)}
                sub="valores confirmados"
              />
              <KpiCard
                label="Clientes"
                value={String(kpis.totalClientes)}
                sub="total do evento"
              />
              <KpiCard
                label="Ticket Médio"
                value={formatBRL(kpis.ticketMedio)}
                sub="por cliente"
              />
            </div>

            {/* Days */}
            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.25em",
                  color: "#2a2a2a",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                Dias do Evento
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {dias.map((dia, i) => (
                  <DiaCard key={dia.data} dia={dia} index={i} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 32px",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "1px solid #3d0000",
          borderRadius: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b0000" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          color: "#3a3a3a",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        Nenhum dado disponível
      </p>
      <p
        style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: "12px",
          color: "#2a2a2a",
          textAlign: "center",
        }}
      >
        Clique em "Sincronizar" para buscar os dados do ZigPay
      </p>
    </div>
  );
}