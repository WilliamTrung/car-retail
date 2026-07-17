"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import styles from "./CountdownTimer.module.css";

type CountdownTimerProps = {
  endsAt: string | null | undefined;
  labels?: {
    days?: string;
    hours?: string;
    minutes?: string;
    seconds?: string;
    heading?: string;
  };
  fallback?: ReactNode;
  onExpire?: () => void;
  className?: string;
};

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function partsFrom(endsAtMs: number, nowMs: number): Parts | null {
  const diff = endsAtMs - nowMs;
  if (diff <= 0) return null;
  const totalSec = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function initialParts(endsAt: string | null | undefined): Parts | null {
  if (!endsAt) return null;
  const endsAtMs = Date.parse(endsAt);
  if (Number.isNaN(endsAtMs)) return null;
  return partsFrom(endsAtMs, Date.now());
}

export function CountdownTimer({
  endsAt,
  labels,
  fallback = null,
  onExpire,
  className,
}: CountdownTimerProps) {
  const [parts, setParts] = useState<Parts | null>(() => initialParts(endsAt));
  const [expired, setExpired] = useState(() => {
    if (!endsAt) return true;
    const ms = Date.parse(endsAt);
    return Number.isNaN(ms) || ms <= Date.now();
  });

  useEffect(() => {
    if (!endsAt) {
      setExpired(true);
      setParts(null);
      return;
    }
    const endsAtMs = Date.parse(endsAt);
    if (Number.isNaN(endsAtMs)) {
      setExpired(true);
      setParts(null);
      return;
    }

    const tick = () => {
      const next = partsFrom(endsAtMs, Date.now());
      if (!next) {
        setParts(null);
        setExpired(true);
        onExpire?.();
        return false;
      }
      setParts(next);
      setExpired(false);
      return true;
    };

    if (!tick()) return;

    const id = window.setInterval(() => {
      if (!tick()) window.clearInterval(id);
    }, 1000);

    return () => window.clearInterval(id);
  }, [endsAt, onExpire]);

  if (!endsAt || expired || !parts) {
    return fallback ? <>{fallback}</> : null;
  }

  const cells = [
    { value: pad2(parts.days), label: labels?.days ?? "Ngày" },
    { value: pad2(parts.hours), label: labels?.hours ?? "Giờ" },
    { value: pad2(parts.minutes), label: labels?.minutes ?? "Phút" },
    { value: pad2(parts.seconds), label: labels?.seconds ?? "Giây" },
  ];

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      role="timer"
      aria-live="off"
      aria-label={labels?.heading ?? "Countdown"}
    >
      {labels?.heading ? (
        <p className={styles.heading}>{labels.heading}</p>
      ) : null}
      <div className={styles.cells}>
        {cells.map((cell) => (
          <div key={cell.label} className={styles.cell}>
            <span className={styles.value}>{cell.value}</span>
            <span className={styles.label}>{cell.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
