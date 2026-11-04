import type { Punto } from "./types";

const KEY = "auto:puntos";
const MAX_PUNTOS = 5;

export function leerPuntos(): Punto[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is Punto =>
        !!p &&
        typeof p.lat === "number" &&
        typeof p.lng === "number" &&
        typeof p.ts === "number" &&
        typeof p.precision === "number"
    );
  } catch {
    return [];
  }
}

export function guardarPunto(punto: Punto): Punto[] {
  try {
    const actuales = leerPuntos();
    const nuevos = [punto, ...actuales].slice(0, MAX_PUNTOS);
    window.localStorage.setItem(KEY, JSON.stringify(nuevos));
    return nuevos;
  } catch {
    return [punto];
  }
}

export function actualizarPrimerPunto(parcial: Partial<Punto>): Punto[] {
  try {
    const actuales = leerPuntos();
    if (actuales.length === 0) return actuales;
    const actualizado = { ...actuales[0], ...parcial };
    const nuevos = [actualizado, ...actuales.slice(1)];
    window.localStorage.setItem(KEY, JSON.stringify(nuevos));
    return nuevos;
  } catch {
    return leerPuntos();
  }
}
