const RADIO_TIERRA_M = 6371000;

function aRadianes(deg: number): number {
  return (deg * Math.PI) / 180;
}

function aGrados(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function distanciaMetros(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = aRadianes(lat2 - lat1);
  const dLng = aRadianes(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return RADIO_TIERRA_M * c;
}

export function rumboInicial(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const phi1 = aRadianes(lat1);
  const phi2 = aRadianes(lat2);
  const deltaLambda = aRadianes(lng2 - lng1);
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return (aGrados(theta) + 360) % 360;
}
