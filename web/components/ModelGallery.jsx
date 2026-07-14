"use client";

import { useState } from "react";
import styles from "./ModelGallery.module.css";

/**
 * @param {{ slides: { id: string, url: string, alt: string }[] }} props
 */
export default function ModelGallery({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!slides.length) {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  const active = slides[activeIndex] ?? slides[0];

  return (
    <div className={styles.root}>
      <div className={styles.mainFrame}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={active.url}
          src={active.url}
          alt={active.alt}
          className={styles.mainImage}
        />
      </div>

      {slides.length > 1 ? (
        <div className={styles.thumbs} role="tablist" aria-label="Gallery">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Image ${index + 1}`}
              className={`${styles.thumbBtn} ${index === activeIndex ? styles.thumbActive : ""}`}
              onClick={() => setActiveIndex(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.url} alt="" className={styles.thumbImage} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
