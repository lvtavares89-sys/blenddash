interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

export function KpiCard({ label, value, sub, accent }: KpiCardProps) {
  return (
    <div
      className="relative overflow-hidden animate-slide-up"
      style={{
        background: accent ? "#0f0000" : "#111111",
        border: `1px solid ${accent ? "#3d0000" : "#1e1e1e"}`,
        borderRadius: "2px",
        padding: "24px 28px",
      }}
    >
      {accent && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, #cc0000, #8b0000)",
          }}
        />
      )}
      <p
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.2em",
          color: accent ? "#cc3333" : "#555555",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        {label}
      </p>
      <p
        className="num"
        style={{
          fontSize: "clamp(22px, 3vw, 34px)",
          fontWeight: 700,
          color: accent ? "#ff4444" : "#f0f0f0",
          lineHeight: 1,
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "11px",
            color: "#444444",
            marginTop: "6px",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}