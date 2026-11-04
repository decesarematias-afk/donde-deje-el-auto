"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function ComoFunciona() {
  const [origen, setOrigen] = useState("");

  useEffect(() => {
    // window solo existe en el cliente: el origen se lee recién acá.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigen(window.location.origin);
  }, []);

  return (
    <div className={styles.page}>
      <Link className={styles.volver} href="/">
        volver
      </Link>
      <h1 className={styles.titulo}>Preparar el llavero</h1>
      <p className={styles.bajada}>
        Cinco minutos, una sola vez. Después no volvés acá nunca más.
      </p>
      <ol className={styles.pasos}>
        <li className={styles.paso}>
          <span className={styles.numero}>1</span>
          <p className={styles.texto}>
            Conseguí un llavero NFC NTAG213 o NTAG215. Cuestan poco y se venden en Mercado Libre.
          </p>
        </li>
        <li className={styles.paso}>
          <span className={styles.numero}>2</span>
          <p className={styles.texto}>Instalá NFC Tools, gratis en Android y iPhone.</p>
        </li>
        <li className={styles.paso}>
          <span className={styles.numero}>3</span>
          <p className={styles.texto}>
            Entrá en Escribir, agregá un registro de tipo URL y pegá la dirección de esta app:{" "}
            <span className={styles.origen}>{origen}</span>
          </p>
        </li>
        <li className={styles.paso}>
          <span className={styles.numero}>4</span>
          <p className={styles.texto}>
            Tocá Escribir y apoyá el llavero contra la parte de atrás del teléfono hasta que
            avise.
          </p>
        </li>
        <li className={styles.paso}>
          <span className={styles.numero}>5</span>
          <p className={styles.texto}>
            Probalo: tocá el llavero y tiene que abrirse esta misma app.
          </p>
        </li>
      </ol>
    </div>
  );
}
