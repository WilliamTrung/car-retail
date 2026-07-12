"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import styles from "./HeroCarousel.module.css";

/**
 * @param {{ slides: { id: string, title: string, subtitle?: string, ctaLabel?: string, ctaHref?: string | object, imageUrl?: string }[] }} props
 */
export default function HeroCarousel({ slides }) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || isHovered) return undefined;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [slides.length, next, isHovered]);

  if (!slides.length) return null;

  return (
    <section
      className={styles.root}
      aria-live="polite"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides wrapper with crossfade */}
      <div className={styles.slidesContainer}>
        {slides.map((slide, idx) => {
          const isActive = idx === index;
          return (
            <div
              key={slide.id}
              className={`${styles.slide} ${isActive ? styles.slideActive : ""}`}
              style={slide.imageUrl ? { backgroundImage: `url(${slide.imageUrl})` } : undefined}
              data-has-image={slide.imageUrl ? "true" : "false"}
              aria-hidden={isActive ? undefined : "true"}
            >
              <div className={styles.overlay} />
              <div className={styles.inner}>
                <div className={styles.content}>
                  {isActive ? (
                    <h1 className={styles.title}>{slide.title}</h1>
                  ) : (
                    <p className={styles.title} aria-hidden="true">{slide.title}</p>
                  )}
                  {slide.subtitle && <p className={styles.subtitle}>{slide.subtitle}</p>}
                  {slide.ctaLabel && slide.ctaHref && (
                    <div className={styles.ctaWrapper}>
                      <Link href={slide.ctaHref} className={styles.cta}>
                        {slide.ctaLabel}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={prev}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={next}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Pagination Dots (Pill indicators) */}
      {slides.length > 1 && (
        <div className={styles.dots}>
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={styles.dot}
              data-active={i === index ? "true" : "false"}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
