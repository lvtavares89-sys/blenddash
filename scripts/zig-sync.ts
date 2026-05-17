import path from "path";
import { config } from "dotenv";
config({ path: path.resolve(process.cwd(), ".env") });

import { chromium, type Page } from "playwright";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const ZIG_URL = "https://dashboard.zigpay.com.br";
const CREDENTIALS = { org: "blend", login: "bruno", senha: "0802" };

const PLACES = [
  {
    id: "5fefd5a0-f496-4316-8032-9ae8014f7a39",
    nome: "BLEND BBQ FESTIVAL NOVA IGUACU 2026 - 1",
  },
  {
    id: "f8312cc2-c291-4889-9d7c-84a8ccabb20a",
    nome: "BLEND BBQ FESTIVAL NOVA IGUACU 2026 2",
  },
];

function parseBRL(raw: string): number {
  return parseFloat(raw.replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
}

function parseDate(raw: string): Date {
  // "17/05/2026 - domingo" → Date
  const match = raw.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) throw new Error(`Invalid date: ${raw}`);
  const [, day, month, year] = match;
  return new Date(`${year}-${month}-${day}T12:00:00.000Z`);
}

async function scrapeItensVenda(page: Page, placeId: string): Promise<number> {
  console.log(`  → Scraping itens vendidos...`);
  await page.goto(`${ZIG_URL}/place/${placeId}/bar-reports#/SoldProducts`, { waitUntil: "networkidle" });

  await page
    .locator("table")
    .first()
    .waitFor({ timeout: 15000 })
    .catch(() => console.log("  ⚠ Tabela de itens não encontrada"));

  const rows: string[][] = await page.evaluate(() => {
    const trs = Array.from(document.querySelectorAll("table tr"));
    return trs.map(row => {
      const cells = Array.from(row.querySelectorAll("td, th"));
      return cells.map(c => (c as HTMLElement).innerText?.trim() ?? "").filter(t => t);
    }).filter(r => r.length > 0);
  });

  let categoria = "";
  let count = 0;

  for (const row of rows) {
    if (row.length === 1 && !row[0].startsWith("Total") && row[0] !== "SKU") {
      categoria = row[0];
    } else if (row.length === 5 && row[0] !== "SKU" && !row[1].includes("Devolução")) {
      const [sku, nome, qtdStr, unitStr, totalStr] = row;
      const quantidade = parseInt(qtdStr, 10) || 0;
      if (quantidade < 0) continue;
      const valorUnitario = parseBRL(unitStr);
      const valorTotal = parseBRL(totalStr);

      await db.zigItemVenda.upsert({
        where: { placeId_sku: { placeId, sku } },
        update: { nome, categoria, quantidade, valorUnitario, valorTotal },
        create: {
          id: `${placeId.slice(0, 8)}-${sku}`,
          placeId,
          sku,
          nome,
          categoria,
          quantidade,
          valorUnitario,
          valorTotal,
        },
      });
      count++;
    }
  }
  return count;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let totalSync = 0;
  let erro: string | null = null;

  try {
    // ─── Login ────────────────────────────────────────────────
    await page.goto(`${ZIG_URL}/login`, { waitUntil: "networkidle" });

    await page.getByRole("textbox", { name: "login-organization" }).fill(CREDENTIALS.org);
    await page.getByRole("textbox", { name: "login-username" }).fill(CREDENTIALS.login);
    await page.getByRole("textbox", { name: "login-password" }).fill(CREDENTIALS.senha);
    await page.getByRole("button", { name: "button-login-submit" }).click();
    await page.waitForURL(`${ZIG_URL}/`, { timeout: 15000 });

    console.log("✓ Login realizado");

    // ─── Upsert places ────────────────────────────────────────
    for (const place of PLACES) {
      await db.zigPlace.upsert({
        where: { id: place.id },
        update: { nome: place.nome },
        create: { id: place.id, nome: place.nome },
      });
    }

    // ─── Scrape each place ────────────────────────────────────
    for (const place of PLACES) {
      console.log(`\n→ Scraping: ${place.nome}`);
      await page.goto(`${ZIG_URL}/place/${place.id}`, { waitUntil: "networkidle" });

      // Wait for at least one event link to appear (up to 10s)
      await page
        .locator('a[href*="/event/"]')
        .first()
        .waitFor({ timeout: 10000 })
        .catch(() => console.log("  ⚠ Nenhum link de evento encontrado, tentando mesmo assim"));

      // Extract all event links on the page
      const eventos = await page.evaluate(() => {
        const links = Array.from(
          document.querySelectorAll<HTMLAnchorElement>('a[href*="/event/"]')
        );

        return links.map((link) => {
          const href = link.getAttribute("href") ?? "";
          const eventId = href.match(/\/event\/([^/]+)/)?.[1] ?? "";

          // Get all paragraph elements: they alternate value/label
          const paras = Array.from(link.querySelectorAll("p")).map((p) =>
            p.textContent?.trim() ?? ""
          );

          const dataMap: Record<string, string> = {};
          for (let i = 0; i + 1 < paras.length; i += 2) {
            dataMap[paras[i + 1]] = paras[i];
          }

          // Status: last div with text "Aberto" or "Encerrado"
          const allDivs = Array.from(link.querySelectorAll("div"));
          const statusDiv = [...allDivs].reverse().find(
            (d) =>
              d.childElementCount === 0 &&
              (d.textContent?.includes("Aberto") ||
                d.textContent?.includes("Encerrado"))
          );
          const status = statusDiv?.textContent?.trim() ?? "";

          // Date text: find element matching dd/mm/yyyy pattern
          const allTexts = Array.from(link.querySelectorAll("div, p, span")).map(
            (el) => el.textContent?.trim() ?? ""
          );
          const dateStr =
            allTexts.find((t) => /\d{2}\/\d{2}\/\d{4}/.test(t)) ?? "";

          return { eventId, dataMap, status, dateStr, href };
        });
      });

      console.log(`  Encontrados ${eventos.length} eventos`);

      for (const ev of eventos) {
        if (!ev.eventId || !ev.dateStr) {
          console.log(`  ⚠ Ignorando evento sem ID ou data: ${JSON.stringify(ev)}`);
          continue;
        }

        let data: Date;
        try {
          data = parseDate(ev.dateStr);
        } catch {
          console.log(`  ⚠ Data inválida: ${ev.dateStr}`);
          continue;
        }

        const status = ev.status.toLowerCase().includes("aberto")
          ? "aberto"
          : "encerrado";

        const clientes = parseInt(ev.dataMap["CLIENTES"] ?? "0", 10) || 0;
        const vendas = parseBRL(ev.dataMap["VENDAS"] ?? "0");
        const recebimentos = parseBRL(ev.dataMap["RECEBIMENTOS"] ?? "0");
        const ticketMedio = parseBRL(ev.dataMap["TICKET MÉDIO"] ?? "0");

        await db.zigEvento.upsert({
          where: { id: ev.eventId },
          update: { status, clientes, vendas, recebimentos, ticketMedio },
          create: {
            id: ev.eventId,
            placeId: place.id,
            data,
            status,
            clientes,
            vendas,
            recebimentos,
            ticketMedio,
          },
        });

        console.log(
          `  ✓ ${data.toLocaleDateString("pt-BR")} [${status}] clientes=${clientes} vendas=R$${vendas.toFixed(0)}`
        );
        totalSync++;
      }

      const itensSync = await scrapeItensVenda(page, place.id);
      console.log(`  ✓ ${itensSync} itens de vendas sincronizados`);
      totalSync += itensSync;
    }

    await db.zigSyncLog.create({
      data: { sucesso: true, eventosSync: totalSync },
    });

    console.log(`\n✅ Sync completo: ${totalSync} eventos`);
  } catch (e) {
    erro = e instanceof Error ? e.message : String(e);
    console.error("❌ Erro:", erro);
    await db.zigSyncLog.create({
      data: { sucesso: false, erro, eventosSync: totalSync },
    });
  } finally {
    await browser.close();
    await db.$disconnect();
  }

  if (erro) process.exit(1);
}

main();