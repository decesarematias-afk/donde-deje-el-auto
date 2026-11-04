"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Flecha } from "@/components/Flecha";
import { Historial } from "@/components/Historial";
import { useCompass } from "@/hooks/useCompass";
import { useUbicacionActual } from "@/hooks/useUbicacionActual";
import { distanciaMetros, rumboInicial } from "@/lib/geo";
import {
  esVigente,
  formatearDistancia,
  formatearPrecision,
  formatearSelloTiempo,
} from "@/lib/format";
import { actualizarPrimerPunto, guardarPunto, leerPuntos } from "@/lib/storage";
import type { Punto } from "@/lib/types";
import styles from "./page.module.css";

const UMBRAL_CERCANIA_M = 15;
const DURACION_AFINADO_MS = 8000;

type FaseGuardado = "idle" | "guardando" | "afinando";
type ErrorGuardado = "permiso" | "gps" | null;

const TEXTO_PERMISO =
  "Necesito permiso de ubicación. Tocá el candado en la barra del navegador y activá Ubicación.";
const TEXTO_GPS = "No pude tomar la ubicación. Probá de nuevo en unos segundos.";

export default function Home() {
  const [puntos, setPuntos] = useState<Punto[] | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());
  const [faseGuardado, setFaseGuardado] = useState<FaseGuardado>("idle");
  const [errorGuardado, setErrorGuardado] = useState<ErrorGuardado>(null);
  const [historialAbierto, setHistorialAbierto] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // localStorage no existe en el servidor: hay que leerlo recién acá, en el cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPuntos(leerPuntos());
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setAhora(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const limpiarWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => limpiarWatch();
  }, [limpiarWatch]);

  const puntoVigente = useMemo(() => {
    if (!puntos || puntos.length === 0) return null;
    return esVigente(puntos[0].ts, ahora) ? puntos[0] : null;
  }, [puntos, ahora]);

  const trackingActivo = !!puntoVigente || historialAbierto;
  const ubicacionActual = useUbicacionActual(trackingActivo);
  const compass = useCompass();

  const distancia = useMemo(() => {
    if (!puntoVigente || ubicacionActual.lat === null || ubicacionActual.lng === null) {
      return null;
    }
    return distanciaMetros(
      ubicacionActual.lat,
      ubicacionActual.lng,
      puntoVigente.lat,
      puntoVigente.lng
    );
  }, [puntoVigente, ubicacionActual]);

  const rumbo = useMemo(() => {
    if (!puntoVigente || ubicacionActual.lat === null || ubicacionActual.lng === null) {
      return null;
    }
    return rumboInicial(
      ubicacionActual.lat,
      ubicacionActual.lng,
      puntoVigente.lat,
      puntoVigente.lng
    );
  }, [puntoVigente, ubicacionActual]);

  const cerca = distancia !== null && distancia < UMBRAL_CERCANIA_M;
  const rotacionFlecha = rumbo !== null ? rumbo - (compass.heading ?? 0) : 0;

  const guardarAuto = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErrorGuardado("gps");
      return;
    }
    limpiarWatch();
    setErrorGuardado(null);
    setFaseGuardado("guardando");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const punto: Punto = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          ts: Date.now(),
          precision: pos.coords.accuracy,
        };
        setPuntos(guardarPunto(punto));
        setAhora(Date.now());
        setFaseGuardado("afinando");

        let mejorPrecision = punto.precision;
        watchIdRef.current = navigator.geolocation.watchPosition(
          (posAfinada) => {
            if (posAfinada.coords.accuracy < mejorPrecision) {
              mejorPrecision = posAfinada.coords.accuracy;
              setPuntos(
                actualizarPrimerPunto({
                  lat: posAfinada.coords.latitude,
                  lng: posAfinada.coords.longitude,
                  precision: posAfinada.coords.accuracy,
                })
              );
            }
          },
          () => {
            // ignoramos errores durante el afinado: ya hay un punto guardado
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );

        timeoutRef.current = window.setTimeout(() => {
          limpiarWatch();
          setFaseGuardado("idle");
        }, DURACION_AFINADO_MS);
      },
      (err) => {
        setFaseGuardado("idle");
        setErrorGuardado(err.code === err.PERMISSION_DENIED ? "permiso" : "gps");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [limpiarWatch]);

  const textoBoton = faseGuardado === "guardando" ? "Tomando ubicación" : "Guardé el auto acá";

  const textoEstado = useMemo(() => {
    if (!puntoVigente) return null;
    if (errorGuardado === "permiso") return TEXTO_PERMISO;
    if (errorGuardado === "gps") return TEXTO_GPS;
    if (ubicacionActual.error === "permiso") return TEXTO_PERMISO;
    if (ubicacionActual.error === "gps") return TEXTO_GPS;
    if (faseGuardado === "afinando") return "afinando la ubicación";
    if (cerca) return "estás arriba del punto — mirá alrededor";
    if (compass.heading === null) return "la flecha apunta desde el norte";
    return formatearPrecision(puntoVigente.precision);
  }, [
    puntoVigente,
    errorGuardado,
    ubicacionActual.error,
    faseGuardado,
    cerca,
    compass.heading,
  ]);

  const esAviso =
    errorGuardado !== null ||
    ubicacionActual.error !== null ||
    (!!puntoVigente && cerca && faseGuardado !== "afinando");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.marca}>dónde dejé el auto</span>
        {puntoVigente && (
          <span className={styles.sello}>{formatearSelloTiempo(puntoVigente.ts, ahora)}</span>
        )}
      </header>

      <main className={styles.central}>
        {faseGuardado === "guardando" ? (
          <p className={styles.estado}>Fijando el punto donde estás parado.</p>
        ) : puntoVigente ? (
          <>
            {rumbo !== null && <Flecha rotacionDeg={rotacionFlecha} atenuada={cerca} />}
            {distancia !== null && (
              <p className={styles.cifra}>{formatearDistancia(distancia)}</p>
            )}
            {textoEstado && (
              <p className={`${styles.estado} ${esAviso ? styles.estadoAviso : ""}`}>
                {textoEstado}
              </p>
            )}
            <div className={styles.acciones}>
              {!compass.activo && (
                <button
                  type="button"
                  className={styles.linkSecundario}
                  onClick={() => compass.activar()}
                >
                  Apuntame hacia el auto
                </button>
              )}
              {puntos && puntos.length > 1 && (
                <button
                  type="button"
                  className={styles.linkSecundario}
                  onClick={() => setHistorialAbierto(true)}
                >
                  Puntos anteriores
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {errorGuardado ? (
              <p className={`${styles.estado} ${styles.estadoAviso}`}>
                {errorGuardado === "permiso" ? TEXTO_PERMISO : TEXTO_GPS}
              </p>
            ) : (
              <p className={styles.vacio}>
                Todavía no guardaste ningún punto. Tocá el llavero cuando bajes del auto.
              </p>
            )}
            {puntos && puntos.length > 1 && (
              <div className={styles.acciones}>
                <button
                  type="button"
                  className={styles.linkSecundario}
                  onClick={() => setHistorialAbierto(true)}
                >
                  Puntos anteriores
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <Link className={styles.comoFunciona} href="/como-funciona">
          cómo funciona
        </Link>
        <div className={styles.franja} />
        <button
          type="button"
          className={styles.botonPrincipal}
          onClick={guardarAuto}
          disabled={faseGuardado === "guardando"}
        >
          {textoBoton}
        </button>
      </footer>

      {historialAbierto && puntos && (
        <Historial
          puntos={puntos}
          posicionActual={ubicacionActual}
          ahora={ahora}
          onCerrar={() => setHistorialAbierto(false)}
        />
      )}
    </div>
  );
}
