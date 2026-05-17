"use server";

import { db } from "@/lib/prisma";

export interface PlaceData {
  placeId: string;
  nome: string;
  clientes: number;
  vendas: number;
  recebimentos: number;
  ticketMedio: number;
}

export interface DiaEvento {
  data: string; // ISO date string
  status: "aberto" | "encerrado";
  totalClientes: number;
  totalVendas: number;
  totalRecebimentos: number;
  ticketMedioUnificado: number;
  places: PlaceData[];
}

export interface EventoKpis {
  totalVendas: number;
  totalRecebimentos: number;
  totalClientes: number;
  ticketMedio: number;
  eventosAbertos: number;
  eventosTotais: number;
}

export async function buscarEventosEmCurso(): Promise<DiaEvento[]> {
  const eventos = await db.zigEvento.findMany({
    include: { place: true },
    orderBy: { data: "desc" },
  });

  const byDate = new Map<string, DiaEvento>();

  for (const ev of eventos) {
    const key = ev.data.toISOString().split("T")[0];
    const vendas = Number(ev.vendas);
    const recebimentos = Number(ev.recebimentos);
    const clientes = ev.clientes;

    if (!byDate.has(key)) {
      byDate.set(key, {
        data: key,
        status: ev.status === "aberto" ? "aberto" : "encerrado",
        totalClientes: 0,
        totalVendas: 0,
        totalRecebimentos: 0,
        ticketMedioUnificado: 0,
        places: [],
      });
    }

    const dia = byDate.get(key)!;
    if (ev.status === "aberto") dia.status = "aberto";
    dia.totalClientes += clientes;
    dia.totalVendas += vendas;
    dia.totalRecebimentos += recebimentos;
    dia.places.push({
      placeId: ev.placeId,
      nome: ev.place.nome,
      clientes,
      vendas,
      recebimentos,
      ticketMedio: Number(ev.ticketMedio),
    });
  }

  for (const dia of byDate.values()) {
    dia.ticketMedioUnificado =
      dia.totalClientes > 0 ? dia.totalVendas / dia.totalClientes : 0;
    dia.places.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  return Array.from(byDate.values()).sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );
}

export async function buscarKpisEvento(): Promise<EventoKpis> {
  const eventos = await db.zigEvento.findMany();

  let totalVendas = 0;
  let totalRecebimentos = 0;
  let totalClientes = 0;
  let eventosAbertos = 0;

  for (const ev of eventos) {
    totalVendas += Number(ev.vendas);
    totalRecebimentos += Number(ev.recebimentos);
    totalClientes += ev.clientes;
    if (ev.status === "aberto") eventosAbertos++;
  }

  return {
    totalVendas,
    totalRecebimentos,
    totalClientes,
    ticketMedio: totalClientes > 0 ? totalVendas / totalClientes : 0,
    eventosAbertos,
    eventosTotais: eventos.length,
  };
}

export async function buscarUltimoSync(): Promise<{
  executadoEm: Date;
  sucesso: boolean;
} | null> {
  return db.zigSyncLog.findFirst({
    orderBy: { executadoEm: "desc" },
    select: { executadoEm: true, sucesso: true },
  });
}