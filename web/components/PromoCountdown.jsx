"use client";

import { useEffect, useState } from "react";
import styles from "./PromoCountdown.module.css";

/** @param {{ endAt: string, label: string }} props */
export default function PromoCountdown({ endAt, label }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const end = new Date(endAt).getTime();
    function tick() {
      const diff = end - Date.now();
      if (diff <= 0) {
        setRemaining("");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${d}d ${h}h ${m}m ${s}s`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  if (!remaining) return null;

  return (
    <section className={styles.banner}>
      <p className={styles.label}>{label}</p>
      <p className={styles.timer}>{remaining}</p>
    </section>
  );
}
