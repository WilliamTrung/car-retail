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

const PLACEHOLDER: Parts = { days: 0, hours: 0, minutes: 0, seconds: 0 };

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

function parseEndsAt(endsAt: string | null | undefined): number | null {
  if (!endsAt) return null;
  const ms = Date.parse(endsAt);
  return Number.isNaN(ms) ? null : ms;
}

export function CountdownTimer({
  endsAt,
  labels,
  fallback = null,
  onExpire,
  className,
}: CountdownTimerProps) {
  const endsAtMs = parseEndsAt(endsAt);
  // Deterministic init — no Date.now() on first paint (avoids React #418).
  const [parts, setParts] = useState<Parts | null>(null);
  const [expired, setExpired] = useState(() => endsAtMs === null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (endsAtMs === null) {
      setExpired(true);
      setParts(null);
      setMounted(true);
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

    setMounted(true);
    if (!tick()) return;

    const id = window.setInterval(() => {
      if (!tick()) window.clearInterval(id);
    }, 1000);

    return () => window.clearInterval(id);
  }, [endsAtMs, onExpire]);

  if (endsAtMs === null || (mounted && (expired || !parts))) {
    return fallback ? <>{fallback}</> : null;
  }

  // Pre-mount: same 4-cell layout with 00 placeholders (no CLS).
  const display = parts ?? PLACEHOLDER;
  const cells = [
    { value: pad2(display.days), label: labels?.days ?? "Ngày" },
    { value: pad2(display.hours), label: labels?.hours ?? "Giờ" },
    { value: pad2(display.minutes), label: labels?.minutes ?? "Phút" },
    { value: pad2(display.seconds), label: labels?.seconds ?? "Giây" },
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
