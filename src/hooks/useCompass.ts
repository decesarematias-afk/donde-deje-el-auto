"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type DeviceOrientationEventConPermiso = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

type EventoOrientacion = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

export function useCompass() {
  const [heading, setHeading] = useState<number | null>(null);
  const [activo, setActivo] = useState(false);
  const listenerAgregado = useRef(false);

  useEffect(() => {
    if (!activo || listenerAgregado.current) return;

    function manejarOrientacion(event: Event) {
      const evento = event as EventoOrientacion;
      if (typeof evento.webkitCompassHeading === "number") {
        setHeading(evento.webkitCompassHeading);
      } else if (typeof evento.alpha === "number") {
        setHeading(360 - evento.alpha);
      }
    }

    window.addEventListener("deviceorientation", manejarOrientacion);
    listenerAgregado.current = true;

    return () => {
      window.removeEventListener("deviceorientation", manejarOrientacion);
      listenerAgregado.current = false;
    };
  }, [activo]);

  const activar = useCallback(async () => {
    try {
      const DOE = window.DeviceOrientationEvent as
        | DeviceOrientationEventConPermiso
        | undefined;
      if (DOE && typeof DOE.requestPermission === "function") {
        const resultado = await DOE.requestPermission();
        if (resultado === "granted") {
          setActivo(true);
        }
      } else {
        setActivo(true);
      }
    } catch {
      // el usuario denegó el permiso o el navegador no lo soporta
    }
  }, []);

  return { heading, activo, activar };
}
