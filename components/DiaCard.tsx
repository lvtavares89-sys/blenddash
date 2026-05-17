import { DiaEvento } from "@/actions/eventos";
import { LiveBadge, ClosedBadge } from "./LiveBadge";
import { formatBRL, formatDate, formatWeekday } from "@/lib/format";

interface DiaCardProps {
  dia: DiaEvento;
  index: number;
}

export function DiaCard({ dia, index }: DiaCardProps) {
  const isLive = dia.status === "aberto";
  const dataObj = new Date(dia.data + "T12:00:00");

  return (
    <div
      className="animate-slide-up"
      style={{
        background: isLive ? "#0c0000" : "#0e0e0e",
        border: `1px solid ${isLive ? "#3d0000" : "#1a1a1a"}`,
        borderRadius: "2px",
        overflow: "hidden",
        animationDelay: `${index * 80}ms`,
        animationFillMode: "both",
        opacity: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: `1px solid ${isLive ? "#3d0000" : "#161616"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                color: isLive ? "#cc0000" : "#3a3a3a",
                textTransform: "uppercase",
                display: "block",
              }}
            >
              {formatWeekday(dataObj)}
            </span>
            <span
              className="num"
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: isLive ? "#ff4444" : "#555555",
                lineHeight: 1,
              }}
            >
              {formatDate(dataObj)}
            </span>
          </div>
          {isLive ? <LiveBadge /> : <ClosedBadge />}
        </div>

        {/* Totals summary */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Stat label="Clientes" value={String(dia.totalClientes)} />
          <Stat label="Vendas" value={formatBRL(dia.totalVendas)} highlight={isLive} />
          <Stat label="Recebimentos" value={formatBRL(dia.totalRecebimentos)} />
          <Stat label="Ticket Médio" value={formatBRL(dia.ticketMedioUnificado)} />
        </div>
      </div>

      {/* PDV Breakdown */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${dia.places.length}, 1fr)`,
          gap: "1px",
          background: isLive ? "#3d0000" : "#141414",
        }}
      >
        {dia.places.map((place) => (
          <div
            key={place.placeId}
            style={{
              background: isLive ? "#0f0000" : "#111111",
              padding: "14px 24px",
            }}
          >
            <p
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                color: isLive ? "#8b0000" : "#2a2a2a",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              {place.nome.split(" ").slice(-1)[0].match(/^\d/) ? `PDV ${place.nome.slice(-1)}` : place.nome}
            </p>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <MiniStat label="Clientes" value={String(place.clientes)} live={isLive} />
              <MiniStat label="Vendas" value={formatBRL(place.vendas)} live={isLive} />
              <MiniStat label="Ticket" value={formatBRL(place.ticketMedio)} live={isLive} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "9px",
          fontWeight: 600,
          letterSpacing: "0.18em",
          color: "#3a3a3a",
          textTransform: "uppercase",
          marginBottom: "2px",
        }}
      >
        {label}
      </p>
      <p
        className="num"
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: highlight ? "#ff6666" : "#888888",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  live,
}: {
  label: string;
  value: string;
  live?: boolean;
}) {
  return (
    <div>
      <p
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "8px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          color: live ? "#5a0000" : "#262626",
          textTransform: "uppercase",
          marginBottom: "1px",
        }}
      >
        {label}
      </p>
      <p
        className="num"
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: live ? "#cc3333" : "#3a3a3a",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}