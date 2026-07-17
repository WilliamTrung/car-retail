"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import type { SiteChromeVM } from "@/lib/view-models";
import styles from "./MobileActionBar.module.css";

type Props = {
  hotline: SiteChromeVM["hotline"];
  zaloUrl: string;
};

/** ≤900px pinned bottom bar: Gọi · Zalo · Lái thử. */
export function MobileActionBar({ hotline, zaloUrl }: Props) {
  const t = useTranslations("chrome");

  return (
    <nav className={styles.bar} aria-label={t("mobileActions")}>
      {hotline.tel ? (
        <a href={hotline.tel} className={styles.action}>
          <Icon name="phone" size={20} />
          <span>{t("call")}</span>
        </a>
      ) : (
        <span className={[styles.action, styles.disabled].join(" ")} aria-disabled>
          <Icon name="phone" size={20} />
          <span>{t("call")}</span>
        </span>
      )}
      {zaloUrl ? (
        <a
          href={zaloUrl}
          className={styles.action}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="zalo" size={20} />
          <span>{t("zalo")}</span>
        </a>
      ) : (
        <span className={[styles.action, styles.disabled].join(" ")} aria-disabled>
          <Icon name="zalo" size={20} />
          <span>{t("zalo")}</span>
        </span>
      )}
      <Link href="/book-test-drive" className={styles.action}>
        <Icon name="check" size={20} />
        <span>{t("testDrive")}</span>
      </Link>
    </nav>
  );
}
