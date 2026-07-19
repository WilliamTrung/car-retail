"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import styles from "./SmartImage.module.css";

type ImageState = "loading" | "loaded" | "error";

type SmartImageProps = {
  src: string | null | undefined;
  alt: string;
  /** Required — reserves box to prevent CLS. e.g. "4 / 3", "16 / 9" */
  aspectRatio: string;
  sizes: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  /** @deprecated Ignored — visible fallback uses localized `image.comingSoon`. Kept for call-site back-compat. */
  placeholderCaption?: string;
  className?: string;
  imgClassName?: string;
};

function CarGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 32"
      width={48}
      height={32}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M9.5 20.5h1.8c.7-2.2 2.8-3.8 5.2-3.8h15c2.4 0 4.5 1.6 5.2 3.8h1.8c1.4 0 2.5 1.1 2.5 2.5v3c0 1.4-1.1 2.5-2.5 2.5h-1.2c0 2-1.6 3.5-3.5 3.5S30.8 30 30.8 28h-13.6c0 2-1.6 3.5-3.5 3.5S10.2 30 10.2 28H9c-1.4 0-2.5-1.1-2.5-2.5v-3c0-1.4 1.1-2.5 2.5-2.5Zm6.5-1.5c-1.1 0-2.1.7-2.5 1.7h5c-.4-1-1.4-1.7-2.5-1.7Zm16 0c-1.1 0-2.1.7-2.5 1.7h5c-.4-1-1.4-1.7-2.5-1.7ZM12.8 14l2.6-5.2c.3-.6.9-1 1.6-1h14c.7 0 1.3.4 1.6 1L35.2 14H12.8Z"
      />
    </svg>
  );
}

export function SmartImage({
  src,
  alt,
  aspectRatio,
  sizes,
  priority = false,
  fill = true,
  width,
  height,
  className,
  imgClassName,
}: SmartImageProps) {
  // placeholderCaption kept on props for call-site back-compat; ignored (localized fallback).
  const t = useTranslations("image");
  const [state, setState] = useState<ImageState>(src ? "loading" : "error");

  useEffect(() => {
    setState(src ? "loading" : "error");
  }, [src]);

  const isError = !src || state === "error";
  const showSkeleton = Boolean(src) && state === "loading";

  return (
    <div
      className={[styles.frame, className].filter(Boolean).join(" ")}
      style={{ aspectRatio }}
    >
      {isError ? (
        <div className={styles.fallback} role="img" aria-label={alt || t("comingSoon")}>
          <CarGlyph className={styles.glyph} />
          <span className={styles.caption}>{t("comingSoon")}</span>
        </div>
      ) : (
        <>
          {showSkeleton ? (
            <>
              <span className={styles.srOnly}>{t("loading")}</span>
              <div className={styles.skeleton} aria-hidden="true" />
            </>
          ) : null}
          {fill ? (
            <Image
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              priority={priority}
              onLoad={() => setState("loaded")}
              onError={() => setState("error")}
              className={[
                styles.img,
                state !== "loaded" ? styles.imgPending : null,
                imgClassName,
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              width={width ?? 800}
              height={height ?? 600}
              sizes={sizes}
              priority={priority}
              onLoad={() => setState("loaded")}
              onError={() => setState("error")}
              className={[
                styles.img,
                state !== "loaded" ? styles.imgPending : null,
                imgClassName,
              ]
                .filter(Boolean)
                .join(" ")}
            />
          )}
        </>
      )}
    </div>
  );
}
