"use client";

import styles from "./Flecha.module.css";

type Props = {
  rotacionDeg: number;
  atenuada: boolean;
};

export function Flecha({ rotacionDeg, atenuada }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={styles.flecha}
      style={{
        transform: atenuada ? "rotate(0deg)" : `rotate(${rotacionDeg}deg)`,
        opacity: atenuada ? 0.22 : 1,
      }}
      aria-hidden="true"
    >
      <path d="M50 6 L78 82 L50 66 L22 82 Z" fill="var(--vial)" />
    </svg>
  );
}
