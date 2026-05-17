export function LiveBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 10px",
        background: "rgba(204, 0, 0, 0.12)",
        border: "1px solid rgba(204, 0, 0, 0.4)",
        borderRadius: "2px",
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.15em",
        color: "#ff4444",
        textTransform: "uppercase",
      }}
    >
      <span
        className="live-dot"
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#cc0000",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      Ao Vivo
    </span>
  );
}

export function ClosedBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 10px",
        background: "rgba(30, 30, 30, 0.8)",
        border: "1px solid #2a2a2a",
        borderRadius: "2px",
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.12em",
        color: "#4a4a4a",
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#2a2a2a",
          display: "inline-block",
        }}
      />
      Encerrado
    </span>
  );
}