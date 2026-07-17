import Image from "next/image";
import styles from "./SmartImage.module.css";

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
  placeholderCaption?: string;
  className?: string;
  imgClassName?: string;
};

export function SmartImage({
  src,
  alt,
  aspectRatio,
  sizes,
  priority = false,
  fill = true,
  width,
  height,
  placeholderCaption,
  className,
  imgClassName,
}: SmartImageProps) {
  const caption = placeholderCaption ?? (alt ? `Ảnh ${alt}` : "Ảnh");

  return (
    <div
      className={[styles.frame, className].filter(Boolean).join(" ")}
      style={{ aspectRatio }}
    >
      {src ? (
        fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={[styles.img, imgClassName].filter(Boolean).join(" ")}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width ?? 800}
            height={height ?? 600}
            sizes={sizes}
            priority={priority}
            className={[styles.img, imgClassName].filter(Boolean).join(" ")}
          />
        )
      ) : (
        <div className={styles.placeholder} role="img" aria-label={caption}>
          <span className={styles.placeholderCaption}>{caption}</span>
        </div>
      )}
    </div>
  );
}
