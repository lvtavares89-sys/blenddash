import { listarFestivais, festivalAtual } from "@/actions/eventos";
import { FestivalSelector } from "./FestivalSelector";
import { SidebarNav } from "./SidebarNav";

export async function Sidebar() {
  const [festivais, atual] = await Promise.all([
    listarFestivais().catch(() => []),
    festivalAtual().catch(() => undefined),
  ]);

  const opcoes = festivais.map(f => ({
    nome: f.nome,
    placesAtivos: f.placesAtivos,
    ultimaData: f.ultimaData ? f.ultimaData.toISOString() : null,
  }));

  return (
    <nav
      style={{
        width: "200px",
        minWidth: "200px",
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
      <div style={{ padding: "0 16px 16px", borderBottom: "1px solid #1a0000", marginBottom: "16px" }}>
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
        <br />
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "9px",
            fontWeight: 500,
            letterSpacing: "0.2em",
            color: "#2a2a2a",
            textTransform: "uppercase",
          }}
        >
          Dashboard
        </span>
      </div>

      <FestivalSelector festivais={opcoes} selecionado={atual ?? null} />

      <SidebarNav />
    </nav>
  );
}
