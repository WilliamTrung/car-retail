"use client";

import {
  useCallback,
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
} from "react";
import type { ModelDetailVM } from "@/lib/view-models/model-detail";
import { SmartImage } from "@/components/ui/SmartImage";
import styles from "./GalleryHero.module.css";

type GalleryHeroProps = {
  gallery: ModelDetailVM["gallery"];
  colorSwatches: ModelDetailVM["colorSwatches"];
  priority?: boolean;
  labels?: {
    gallery?: string;
    thumbs?: string;
    swatches?: string;
  };
};

export function GalleryHero({
  gallery,
  colorSwatches,
  priority = true,
  labels,
}: GalleryHeroProps) {
  const labelId = useId();
  const thumbs = gallery.thumbs;
  const [activeIndex, setActiveIndex] = useState(0);
  const [mainUrl, setMainUrl] = useState<string | null>(
    gallery.mainUrl ?? thumbs[0] ?? null,
  );

  useEffect(() => {
    setMainUrl(gallery.mainUrl ?? thumbs[0] ?? null);
    setActiveIndex(0);
  }, [gallery.mainUrl, thumbs]);

  const selectThumb = useCallback(
    (index: number) => {
      const url = thumbs[index];
      if (!url) return;
      setActiveIndex(index);
      setMainUrl(url);
    },
    [thumbs],
  );

  const onThumbKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (thumbs.length === 0) return;
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      next = (index + 1) % thumbs.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      next = (index - 1 + thumbs.length) % thumbs.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      next = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      next = thumbs.length - 1;
    } else {
      return;
    }
    selectThumb(next);
    const btn = e.currentTarget
      .closest('[role="listbox"]')
      ?.querySelectorAll<HTMLButtonElement>("[data-thumb]")[next];
    btn?.focus();
  };

  const selectSwatch = (swatch: ModelDetailVM["colorSwatches"][number]) => {
    if (swatch.imageUrl) setMainUrl(swatch.imageUrl);
  };

  return (
    <div className={styles.root} role="region" aria-labelledby={labelId}>
      <p id={labelId} className={styles.srOnly}>
        {labels?.gallery ?? "Gallery"}
      </p>
      <SmartImage
        src={mainUrl}
        alt={gallery.alt}
        aspectRatio="4 / 3"
        sizes="(max-width: 900px) 100vw, 50vw"
        priority={priority}
        className={styles.main}
      />

      {thumbs.length > 0 ? (
        <ul
          className={styles.thumbs}
          role="listbox"
          aria-label={labels?.thumbs ?? "Thumbnails"}
        >
          {thumbs.map((url, i) => (
            <li key={`${url}-${i}`} role="none">
              <button
                type="button"
                data-thumb
                role="option"
                aria-selected={i === activeIndex}
                className={[
                  styles.thumb,
                  i === activeIndex && styles.thumbActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => selectThumb(i)}
                onKeyDown={(e) => onThumbKeyDown(e, i)}
              >
                <SmartImage
                  src={url}
                  alt=""
                  aspectRatio="4 / 3"
                  sizes="120px"
                  priority={false}
                  className={styles.thumbImg}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {colorSwatches.length > 0 ? (
        <ul
          className={styles.swatches}
          aria-label={labels?.swatches ?? "Colors"}
        >
          {colorSwatches.map((swatch) => (
            <li key={`${swatch.name}-${swatch.hex}`}>
              <button
                type="button"
                className={styles.swatch}
                style={{ backgroundColor: swatch.hex }}
                aria-label={swatch.name || swatch.hex}
                title={swatch.name || swatch.hex}
                onClick={() => selectSwatch(swatch)}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
