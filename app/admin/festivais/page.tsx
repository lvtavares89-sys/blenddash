import { listarFestivais, listarPlacesDoFestival, festivalAtual } from "@/actions/eventos";
import { PlaceToggleButton } from "@/components/PlaceToggleButton";
import { nomePdv } from "@/lib/festival";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FestivaisAdminPage() {
  const [festivais, atual] = await Promise.all([
    listarFestivais(),
    festivalAtual(),
  ]);

  const placesPorFestival = await Promise.all(
    festivais.map(f => listarPlacesDoFestival(f.nome).then(places => ({ nome: f.nome, places })))
  );
  const placesMap = new Map(placesPorFestival.map(p => [p.nome, p.places]));

  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#080808" }}>
      <div style={{ marginBottom: "28px" }}>
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
          Administração
        </p>
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(20px, 3vw, 30px)",
            fontWeight: 800,
            letterSpacing: "0.05em",
            color: "#e0e0e0",
            textTransform: "uppercase",
            lineHeight: 1,
            margin: 0,
          }}
        >
          Festivais & PDVs
        </h1>
        <p
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "11px",
            color: "#3a3a3a",
            marginTop: "6px",
          }}
        >
          Marque um PDV como inativo para excluí-lo do próximo sync. Os dados ficam preservados no banco.
        </p>
        <hr style={{ border: "none", height: "1px", background: "linear-gradient(90deg, #3d0000, transparent)", marginTop: "16px" }} />
      </div>

      {festivais.length === 0 && (
        <p
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "12px",
            color: "#2a2a2a",
            textAlign: "center",
            padding: "60px 0",
          }}
        >
          Nenhum festival encontrado. Execute o sync primeiro.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {festivais.map(f => {
          const places = placesMap.get(f.nome) ?? [];
          const isAtual = f.nome === atual;

          return (
            <div
              key={f.nome}
              style={{
                background: "#0f0f0f",
                border: isAtual ? "1px solid #3d0000" : "1px solid #1a1a1a",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #1a0000",
                  background: isAtual ? "#0f0500" : "#0a0a0a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h2
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "16px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        color: isAtual ? "#cc0000" : "#d0d0d0",
                        textTransform: "uppercase",
                        margin: 0,
                      }}
                    >
                      {f.nome}
                    </h2>
                    {isAtual && (
                      <span
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: "8px",
                          fontWeight: 700,
                          letterSpacing: "0.25em",
                          color: "#cc0000",
                          background: "#1a0000",
                          border: "1px solid #3d0000",
                          padding: "2px 6px",
                          borderRadius: "2px",
                          textTransform: "uppercase",
                        }}
                      >
                        Atual
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontSize: "10px",
                      color: "#3a3a3a",
                      margin: "4px 0 0",
                    }}
                  >
                    {f.placesAtivos}/{f.placesCount} PDV{f.placesCount !== 1 ? "s" : ""} ativo
                    {f.placesAtivos !== 1 ? "s" : ""} · {f.totalEventos} evento
                    {f.totalEventos !== 1 ? "s" : ""}
                    {f.primeiraData && f.ultimaData && (
                      <>
                        {" · "}
                        {f.primeiraData.toLocaleDateString("pt-BR")}
                        {" → "}
                        {f.ultimaData.toLocaleDateString("pt-BR")}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div>
                {places.map(p => (
                  <div
                    key={p.id}
                    style={{
                      padding: "12px 20px",
                      borderBottom: "1px solid #111",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: p.ativo ? "#d0d0d0" : "#555",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          margin: 0,
                        }}
                      >
                        {nomePdv(p.nome)} <span style={{ color: "#333" }}>· {p.nome}</span>
                      </p>
                      <p
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "9px",
                          color: "#2a2a2a",
                          margin: "2px 0 0",
                        }}
                      >
                        {p.id}
                      </p>
                    </div>
                    <PlaceToggleButton placeId={p.id} ativo={p.ativo} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
