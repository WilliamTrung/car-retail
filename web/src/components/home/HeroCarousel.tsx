"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { HeroSlideVM } from "@/lib/view-models/home";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { SmartImage } from "@/components/ui/SmartImage";
import styles from "./HeroCarousel.module.css";

const AUTO_MS = 5000;

type HeroCarouselProps = {
  slides: HeroSlideVM[];
  emptyFallback: HeroSlideVM;
  labels: {
    carousel: string;
    previous: string;
    next: string;
    goToSlide: string;
    pause: string;
    play: string;
  };
  /** Mobile stacked layout uses hotline as secondary CTA when provided */
  mobileSecondary?: { label: string; href: string } | null;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HeroCarousel({
  slides,
  emptyFallback,
  labels,
  mobileSecondary,
}: HeroCarouselProps) {
  const list = slides.length > 0 ? slides : [emptyFallback];
  const multi = list.length > 1;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const regionRef = useRef<HTMLElement>(null);
  const labelId = useId();

  const safeIndex = ((index % list.length) + list.length) % list.length;
  const current = list[safeIndex] ?? emptyFallback;

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const go = useCallback(
    (next: number) => {
      if (!multi) return;
      const len = list.length;
      setIndex(((next % len) + len) % len);
    },
    [list.length, multi],
  );

  useEffect(() => {
    if (!multi || paused || reducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [multi, paused, reducedMotion, list.length]);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!multi) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(safeIndex - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(safeIndex + 1);
    }
  };

  const desktopSecondary = current.secondaryCta ?? null;
  const phoneSecondary = mobileSecondary ?? desktopSecondary;

  return (
    <section
      ref={regionRef}
      className={styles.root}
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!regionRef.current?.contains(e.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
    >
      <p id={labelId} className={styles.srOnly}>
        {labels.carousel}
      </p>

      <div className={styles.inner}>
        <div className={styles.copy}>
          {current.promoChip ? (
            <Chip variant="promo" className={styles.chip}>
              {current.promoChip}
            </Chip>
          ) : null}
          <h1 className={styles.title}>{current.title}</h1>
          {current.subtitle ? (
            <p className={styles.subtitle}>{current.subtitle}</p>
          ) : null}
          <div className={styles.actions}>
            <Button
              variant="primary"
              size="lg"
              href={current.primaryCta.href}
            >
              {current.primaryCta.label}
            </Button>
            {desktopSecondary ? (
              <Button
                variant="dark-outline"
                size="lg"
                href={desktopSecondary.href}
                className={styles.secondaryDesktop}
              >
                {desktopSecondary.label}
              </Button>
            ) : null}
            {phoneSecondary ? (
              <Button
                variant="dark-outline"
                size="lg"
                href={phoneSecondary.href}
                className={styles.secondaryMobile}
              >
                <Icon name="phone" size={18} />
                {phoneSecondary.label}
              </Button>
            ) : null}
          </div>
        </div>

        <div className={styles.media}>
          {list.map((slide, i) => (
            <div
              key={slide.id}
              className={styles.slide}
              data-active={i === safeIndex ? "true" : "false"}
              aria-hidden={i !== safeIndex}
            >
              <SmartImage
                src={slide.imageUrl}
                alt={slide.imageAlt}
                aspectRatio="4 / 3"
                sizes="(max-width: 900px) 100vw, 50vw"
                priority={i === 0}
                placeholderCaption={slide.imageAlt || "Ảnh hero"}
              />
            </div>
          ))}
        </div>
      </div>

      {multi ? (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            aria-label={labels.previous}
            onClick={() => go(safeIndex - 1)}
          >
            <Icon name="chevron" size={22} className={styles.arrowPrev} />
          </button>
          <div className={styles.dots} role="tablist" aria-label={labels.carousel}>
            {list.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={i === safeIndex}
                aria-label={labels.goToSlide.replace("{n}", String(i + 1))}
                className={styles.dot}
                data-active={i === safeIndex ? "true" : "false"}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className={styles.arrow}
            aria-label={labels.next}
            onClick={() => go(safeIndex + 1)}
          >
            <Icon name="chevron" size={22} />
          </button>
          <button
            type="button"
            className={styles.pause}
            aria-label={paused || reducedMotion ? labels.play : labels.pause}
            onClick={() => setPaused((p) => !p)}
            disabled={reducedMotion}
          >
            {paused || reducedMotion ? labels.play : labels.pause}
          </button>
        </div>
      ) : null}
    </section>
  );
}
