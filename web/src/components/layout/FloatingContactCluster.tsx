"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import type { SiteChromeVM } from "@/lib/view-models";
import styles from "./FloatingContactCluster.module.css";

type Props = {
  hotline: SiteChromeVM["hotline"];
  zaloUrl: string;
};

/**
 * Desktop-only (≥901px) fixed FAB cluster: call (pulse), Zalo, back-to-top.
 * Back-to-top via IntersectionObserver on a top sentinel (~1 viewport).
 */
export function FloatingContactCluster({ hotline, zaloUrl }: Props) {
  const t = useTranslations("chrome");
  const [showTop, setShowTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText =
      "position:absolute;top:0;left:0;width:1px;height:100vh;pointer-events:none;opacity:0;";
    document.body.prepend(sentinel);
    sentinelRef.current = sentinel;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setShowTop(!entry.isIntersecting);
      },
      { root: null, threshold: 0 },
    );
    io.observe(sentinel);

    return () => {
      io.disconnect();
      sentinel.remove();
      sentinelRef.current = null;
    };
  }, []);

  function scrollToTop() {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div className={styles.cluster} role="complementary" aria-label={t("floatingContact")}>
      {hotline.tel ? (
        <a
          href={hotline.tel}
          className={styles.fab}
          data-variant="call"
          aria-label={t("callHotline", { phone: hotline.display })}
        >
          <Icon name="phone" size={22} />
        </a>
      ) : null}
      {zaloUrl ? (
        <a
          href={zaloUrl}
          className={styles.fab}
          data-variant="zalo"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("chatZalo")}
        >
          <Icon name="zalo" size={22} />
        </a>
      ) : null}
      <button
        type="button"
        className={[styles.fab, styles.top, showTop && styles.topVisible]
          .filter(Boolean)
          .join(" ")}
        onClick={scrollToTop}
        aria-label={t("backToTop")}
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
      >
        <Icon name="chevron" size={20} className={styles.up} />
      </button>
    </div>
  );
}
