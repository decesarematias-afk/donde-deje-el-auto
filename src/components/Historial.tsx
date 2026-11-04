"use client";

import { useEffect } from "react";
import { distanciaMetros } from "@/lib/geo";
import { formatearDistancia, formatearSelloTiempo } from "@/lib/format";
import type { Punto } from "@/lib/types";
import styles from "./Historial.module.css";

type Props = {
  puntos: Punto[];
  posicionActual: { lat: number | null; lng: number | null };
  ahora: number;
  onCerrar: () => void;
};

function urlMaps(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function Historial({ puntos, posicionActual, ahora, onCerrar }: Props) {
  useEffect(() => {
    function manejarEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    window.addEventListener("keydown", manejarEscape);
    return () => window.removeEventListener("keydown", manejarEscape);
  }, [onCerrar]);

  return (
    <div className={styles.fondo} onClick={onCerrar}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Puntos anteriores"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.encabezado}>
          <h2 className={styles.titulo}>Puntos anteriores</h2>
          <button type="button" className={styles.cerrar} onClick={onCerrar}>
            cerrar
          </button>
        </div>
        <ul className={styles.lista}>
          {puntos.map((punto) => {
            const distancia =
              posicionActual.lat !== null && posicionActual.lng !== null
                ? distanciaMetros(
                    posicionActual.lat,
                    posicionActual.lng,
                    punto.lat,
                    punto.lng
                  )
                : null;
            return (
              <li key={punto.ts} className={styles.fila}>
                <div className={styles.info}>
                  <span className={styles.fecha}>
                    {formatearSelloTiempo(punto.ts, ahora)}
                  </span>
                  {distancia !== null && (
                    <span className={styles.distancia}>
                      {formatearDistancia(distancia)}
                    </span>
                  )}
                </div>
                <a
                  className={styles.boton}
                  href={urlMaps(punto.lat, punto.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir en Maps
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
