export type Punto = {
  lat: number;
  lng: number;
  ts: number; // Date.now() al guardar
  precision: number; // metros, de coords.accuracy
};
