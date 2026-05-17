"use server";

import { db } from "@/lib/prisma";

export interface ItemVenda {
  sku: string;
  nome: string;
  categoria: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  places: { placeId: string; nome: string; quantidade: number; valorTotal: number }[];
}

export interface CategoriaVenda {
  categoria: string;
  totalQuantidade: number;
  totalValor: number;
  itens: ItemVenda[];
}

export async function buscarItensVendidos(): Promise<CategoriaVenda[]> {
  const itens = await db.zigItemVenda.findMany({
    include: { place: true },
    orderBy: [{ categoria: "asc" }, { valorTotal: "desc" }],
  });

  // Merge same produto (same nome) across places by nome+categoria key
  const merged = new Map<string, ItemVenda>();

  for (const item of itens) {
    const key = `${item.categoria}||${item.nome.toUpperCase().trim()}`;
    if (!merged.has(key)) {
      merged.set(key, {
        sku: item.sku,
        nome: item.nome,
        categoria: item.categoria,
        quantidade: 0,
        valorUnitario: Number(item.valorUnitario),
        valorTotal: 0,
        places: [],
      });
    }
    const m = merged.get(key)!;
    m.quantidade += item.quantidade;
    m.valorTotal += Number(item.valorTotal);
    m.places.push({
      placeId: item.placeId,
      nome: item.place.nome.includes("2026 2") ? "PDV 2" : "PDV 1",
      quantidade: item.quantidade,
      valorTotal: Number(item.valorTotal),
    });
  }

  // Group by category
  const byCategoria = new Map<string, CategoriaVenda>();
  for (const item of merged.values()) {
    if (!byCategoria.has(item.categoria)) {
      byCategoria.set(item.categoria, {
        categoria: item.categoria,
        totalQuantidade: 0,
        totalValor: 0,
        itens: [],
      });
    }
    const cat = byCategoria.get(item.categoria)!;
    cat.totalQuantidade += item.quantidade;
    cat.totalValor += item.valorTotal;
    cat.itens.push(item);
  }

  // Sort categories by totalValor desc, items within each category by valorTotal desc
  return Array.from(byCategoria.values())
    .sort((a, b) => b.totalValor - a.totalValor)
    .map(cat => ({
      ...cat,
      itens: cat.itens.sort((a, b) => b.valorTotal - a.valorTotal),
    }));
}

export async function buscarRankingItens(limit = 20): Promise<ItemVenda[]> {
  const cats = await buscarItensVendidos();
  return cats.flatMap(c => c.itens).sort((a, b) => b.valorTotal - a.valorTotal).slice(0, limit);
}