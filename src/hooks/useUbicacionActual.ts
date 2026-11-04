"use client";

import { useEffect, useState } from "react";

type ErrorUbicacion = "permiso" | "gps" | null;

type EstadoUbicacion = {
  lat: number | null;
  lng: number | null;
  error: ErrorUbicacion;
};

export function useUbicacionActual(activo: boolean) {
  const [estado, setEstado] = useState<EstadoUbicacion>({
    lat: null,
    lng: null,
    error: null,
  });

  useEffect(() => {
    if (!activo) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      // geolocation solo se puede chequear en el cliente, dentro del efecto.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEstado((prev) => ({ ...prev, error: "gps" }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setEstado({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
        });
      },
      (err) => {
        setEstado((prev) => ({
          ...prev,
          error: err.code === err.PERMISSION_DENIED ? "permiso" : "gps",
        }));
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [activo]);

  return estado;
}
