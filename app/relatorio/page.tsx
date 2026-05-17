import { buscarItensVendidos, buscarRankingItens } from "@/actions/itens";
import { buscarUltimoSync } from "@/actions/eventos";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RelatorioPage() {
  const [categorias, ranking, ultimoSync] = await Promise.all([
    buscarItensVendidos().catch(() => []),
    buscarRankingItens(15).catch(() => []),
    buscarUltimoSync().catch(() => null),
  ]);

  const totalValor = categorias.reduce((s, c) => s + c.totalValor, 0);
  const totalQtd = categorias.reduce((s, c) => s + c.totalQuantidade, 0);

  const maxValor = ranking[0]?.valorTotal ?? 1;

  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#080808" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.25em", color: "#3a3a3a", textTransform: "uppercase", marginBottom: "4px" }}>
          Produtos Vendidos
        </p>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 800, letterSpacing: "0.05em", color: "#e0e0e0", textTransform: "uppercase", lineHeight: 1, margin: 0 }}>
          Ranking de Itens
        </h1>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "11px", color: "#3a3a3a", marginTop: "6px" }}>
          PDV 1 + PDV 2 — acumulado do evento
          {ultimoSync && (
            <span style={{ marginLeft: "12px" }}>
              · sync {new Date(ultimoSync.executadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </p>
        <hr style={{ border: "none", height: "1px", background: "linear-gradient(90deg, #3d0000, transparent)", marginTop: "16px" }} />
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1px", background: "#1a0000", border: "1px solid #1a0000", borderRadius: "2px", marginBottom: "28px", overflow: "hidden" }}>
        {[
          { label: "Total Vendido", value: formatBRL(totalValor), accent: true },
          { label: "Itens Distintos", value: ranking.length > 0 ? String(categorias.flatMap(c => c.itens).length) : "—" },
          { label: "Unidades", value: totalQtd.toLocaleString("pt-BR") },
          { label: "Categorias", value: String(categorias.length) },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: "#0f0f0f", padding: "16px 20px" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", color: "#3a3a3a", textTransform: "uppercase", margin: 0 }}>
              {kpi.label}
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(16px, 2vw, 22px)", fontWeight: 700, color: kpi.accent ? "#cc0000" : "#e0e0e0", margin: "6px 0 0", letterSpacing: "-0.03em" }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Left: Ranking */}
        <div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.25em", color: "#2a2a2a", textTransform: "uppercase", marginBottom: "12px" }}>
            Top 15 — Maior Receita
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {ranking.map((item, i) => {
              const pct = (item.valorTotal / maxValor) * 100;
              return (
                <div key={`${item.sku}-${i}`} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: "2px", padding: "10px 12px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: "rgba(204,0,0,0.04)", pointerEvents: "none" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#3a3a3a", minWidth: "16px" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 600, color: "#d0d0d0", textTransform: "uppercase", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.nome}
                        </p>
                        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", color: "#3a3a3a", margin: 0 }}>
                          {item.categoria} · {item.quantidade} un
                        </p>
                      </div>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 700, color: "#cc0000", whiteSpace: "nowrap" }}>
                      {formatBRL(item.valorTotal)}
                    </span>
                  </div>
                </div>
              );
            })}
            {ranking.length === 0 && (
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", color: "#2a2a2a", textAlign: "center", padding: "40px 0" }}>
                Sincronize para ver os dados
              </p>
            )}
          </div>
        </div>

        {/* Right: By Category */}
        <div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.25em", color: "#2a2a2a", textTransform: "uppercase", marginBottom: "12px" }}>
            Por Categoria
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {categorias.map(cat => (
              <details key={cat.categoria} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: "2px", overflow: "hidden" }}>
                <summary style={{ padding: "10px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", listStyle: "none", userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, color: "#c0c0c0", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {cat.categoria}
                    </span>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", color: "#3a3a3a" }}>
                      {cat.totalQuantidade} un
                    </span>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 700, color: "#cc0000" }}>
                    {formatBRL(cat.totalValor)}
                  </span>
                </summary>
                <div style={{ borderTop: "1px solid #1a0000" }}>
                  {cat.itens.slice(0, 10).map(item => (
                    <div key={item.sku} style={{ padding: "7px 12px 7px 28px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #111" }}>
                      <div>
                        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "11px", color: "#888", margin: 0 }}>
                          {item.nome}
                        </p>
                        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "9px", color: "#333", margin: 0 }}>
                          {item.quantidade} un · {formatBRL(item.valorUnitario)} cada
                        </p>
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#888" }}>
                        {formatBRL(item.valorTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
            {categorias.length === 0 && (
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", color: "#2a2a2a", textAlign: "center", padding: "40px 0" }}>
                Sem dados
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}