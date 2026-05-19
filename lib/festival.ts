/**
 * "BLEND BBQ FESTIVAL NOVA IGUACU 2026 - 1" → "BLEND BBQ FESTIVAL NOVA IGUACU 2026"
 * "BLEND BBQ FESTIVAL NOVA IGUACU 2026 2"   → "BLEND BBQ FESTIVAL NOVA IGUACU 2026"
 */
export function extrairFestival(nomePlace: string): string {
  return nomePlace
    .trim()
    .replace(/\s*[-–]\s*\d+\s*$/, "")
    .replace(/\s+\d+\s*$/, "")
    .trim();
}

/**
 * "BLEND BBQ FESTIVAL NOVA IGUACU 2026 - 1" → "PDV 1"
 */
export function nomePdv(nomePlace: string): string {
  const m = nomePlace.match(/[-–]?\s*(\d+)\s*$/);
  return m ? `PDV ${m[1]}` : "PDV";
}