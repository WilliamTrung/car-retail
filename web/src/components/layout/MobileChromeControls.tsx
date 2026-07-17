"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import type { SiteChromeVM } from "@/lib/view-models";
import { MobileNav } from "./MobileNav";
import styles from "./SiteHeader.module.css";

type Props = {
  nav: SiteChromeVM["nav"];
  hotline: SiteChromeVM["hotline"];
  zaloUrl: string;
};

/** Hamburger + persistent Zalo/call icons + drawer (≤900px). */
export function MobileChromeControls({ nav, hotline, zaloUrl }: Props) {
  const t = useTranslations("chrome");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.menuBtn}
        aria-label={t("menuOpen")}
        aria-expanded={open}
        aria-controls="site-mobile-nav"
        onClick={() => setOpen(true)}
      >
        <Icon name="menu" size={22} />
      </button>

      <div className={styles.mobileActions}>
        {zaloUrl ? (
          <a
            href={zaloUrl}
            className={styles.iconFab}
            data-variant="zalo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("chatZalo")}
          >
            <Icon name="zalo" size={18} />
          </a>
        ) : null}
        {hotline.tel ? (
          <a
            href={hotline.tel}
            className={styles.iconFab}
            data-variant="call"
            aria-label={t("callHotline", { phone: hotline.display })}
          >
            <Icon name="phone" size={18} />
          </a>
        ) : null}
      </div>

      <div id="site-mobile-nav">
        <MobileNav
          open={open}
          onClose={() => setOpen(false)}
          nav={nav}
          hotline={hotline}
          zaloUrl={zaloUrl}
        />
      </div>
    </>
  );
}
