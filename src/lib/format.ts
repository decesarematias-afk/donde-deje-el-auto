const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export function formatearDistancia(metros: number): string {
  if (metros < 1000) {
    return `${Math.round(metros)} m`;
  }
  const km = metros / 1000;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

export function formatearPrecision(metros: number): string {
  return `precisión ${Math.round(metros)} m`;
}

export function formatearSelloTiempo(ts: number, ahora: number = Date.now()): string {
  const diffMs = ahora - ts;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "recién";
  if (diffMin < 60) return `hace ${diffMin} min`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;

  const fecha = new Date(ts);
  const dia = fecha.getDate();
  const mes = MESES[fecha.getMonth()];
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  return `${dia} ${mes} ${horas}:${minutos}`;
}

export function esVigente(ts: number, ahora: number = Date.now()): boolean {
  const DOCE_HORAS_MS = 12 * 60 * 60 * 1000;
  return ahora - ts < DOCE_HORAS_MS;
}
