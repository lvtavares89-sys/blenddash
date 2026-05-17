import path from "path";
import { config } from "dotenv";
config({ path: path.resolve(process.cwd(), ".env") });

import { Client } from "pg";

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS zig_itens_venda (
      id TEXT PRIMARY KEY,
      place_id TEXT NOT NULL REFERENCES zig_places(id),
      categoria TEXT NOT NULL,
      sku TEXT NOT NULL,
      nome TEXT NOT NULL,
      quantidade INTEGER NOT NULL DEFAULT 0,
      valor_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
      valor_total DECIMAL(12,2) NOT NULL DEFAULT 0,
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(place_id, sku)
    );
    CREATE INDEX IF NOT EXISTS zig_itens_venda_place_id_idx ON zig_itens_venda(place_id);
    CREATE INDEX IF NOT EXISTS zig_itens_venda_categoria_idx ON zig_itens_venda(categoria);
  `);
  console.log("✅ Tabela zig_itens_venda criada/verificada");
  await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });