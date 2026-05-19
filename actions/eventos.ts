"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { extrairFestival } from "@/lib/festival";

const COOKIE_FESTIVAL = "festival_atual";

export interface PlaceData {
  placeId: string;
  nome: string;
  clientes: number;
  vendas: number;
  recebimentos: number;
  ticketMedio: number;
}

export interface DiaEvento {
  data: string;
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

export interface FestivalInfo {
  nome: string;
  placesCount: number;
  placesAtivos: number;
  primeiraData: Date | null;
  ultimaData: Date | null;
  totalEventos: number;
}

async function placeIdsDoFestival(festival?: string): Promise<string[] | undefined> {
  if (!festival) return undefined;
  const places = await db.zigPlace.findMany();
  return places.filter(p => extrairFestival(p.nome) === festival).map(p => p.id);
}

export async function buscarEventosEmCurso(festival?: string): Promise<DiaEvento[]> {
  const placeIds = await placeIdsDoFestival(festival);
  const eventos = await db.zigEvento.findMany({
    where: placeIds ? { placeId: { in: placeIds } } : {},
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

export async function buscarKpisEvento(festival?: string): Promise<EventoKpis> {
  const placeIds = await placeIdsDoFestival(festival);
  const eventos = await db.zigEvento.findMany({
    where: placeIds ? { placeId: { in: placeIds } } : {},
  });

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

export async function listarFestivais(): Promise<FestivalInfo[]> {
  const places = await db.zigPlace.findMany();
  const eventos = await db.zigEvento.findMany({
    select: { placeId: true, data: true },
  });

  const eventosByPlace = new Map<string, Date[]>();
  for (const ev of eventos) {
    if (!eventosByPlace.has(ev.placeId)) eventosByPlace.set(ev.placeId, []);
    eventosByPlace.get(ev.placeId)!.push(ev.data);
  }

  const byFestival = new Map<string, FestivalInfo>();
  for (const place of places) {
    const nome = extrairFestival(place.nome);
    const datas = eventosByPlace.get(place.id) ?? [];

    if (!byFestival.has(nome)) {
      byFestival.set(nome, {
        nome,
        placesCount: 0,
        placesAtivos: 0,
        primeiraData: null,
        ultimaData: null,
        totalEventos: 0,
      });
    }

    const f = byFestival.get(nome)!;
    f.placesCount++;
    if (place.ativo) f.placesAtivos++;
    f.totalEventos += datas.length;

    for (const d of datas) {
      if (!f.primeiraData || d < f.primeiraData) f.primeiraData = d;
      if (!f.ultimaData || d > f.ultimaData) f.ultimaData = d;
    }
  }

  return Array.from(byFestival.values()).sort((a, b) => {
    const aTime = a.ultimaData?.getTime() ?? 0;
    const bTime = b.ultimaData?.getTime() ?? 0;
    return bTime - aTime;
  });
}

export async function festivalAtual(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COOKIE_FESTIVAL)?.value;

  const festivais = await listarFestivais();
  if (festivais.length === 0) return undefined;

  if (fromCookie && festivais.some(f => f.nome === fromCookie)) {
    return fromCookie;
  }
  return festivais[0].nome;
}

export async function setFestivalAtual(nome: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_FESTIVAL, nome, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}

export async function togglePlaceAtivo(placeId: string): Promise<void> {
  const place = await db.zigPlace.findUnique({ where: { id: placeId } });
  if (!place) return;
  await db.zigPlace.update({
    where: { id: placeId },
    data: { ativo: !place.ativo },
  });
  revalidatePath("/admin/festivais");
}

export async function listarPlacesDoFestival(festival: string) {
  const places = await db.zigPlace.findMany({ orderBy: { nome: "asc" } });
  return places.filter(p => extrairFestival(p.nome) === festival);
}
