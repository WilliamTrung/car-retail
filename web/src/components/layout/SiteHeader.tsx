import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import type { SiteChromeVM } from "@/lib/view-models";
import { HeaderNav } from "./HeaderNav";
import { MobileChromeControls } from "./MobileChromeControls";
import styles from "./SiteHeader.module.css";

type Props = {
  chrome: SiteChromeVM;
};

/** Server shell: sticky header. Interactive leaves are client islands. */
export async function SiteHeader({ chrome }: Props) {
  const t = await getTranslations("chrome");
  const { logoText, nav, hotline, zaloUrl } = chrome;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Client island emits: menuBtn, mobileActions, MobileNav (fragment) */}
        <MobileChromeControls nav={nav} hotline={hotline} zaloUrl={zaloUrl} />

        <Link
          href="/"
          className={styles.logo}
          aria-label={
            logoText.accent
              ? `${logoText.primary} ${logoText.accent}`
              : logoText.primary
          }
        >
          <span className={styles.logoPrimary}>{logoText.primary}</span>
          {logoText.accent ? (
            <span className={styles.logoAccent}> {logoText.accent}</span>
          ) : null}
        </Link>

        <nav className={styles.desktopNav} aria-label={t("mainNav")}>
          <HeaderNav nav={nav} allProductsLabel={t("allProducts")} />
        </nav>

        <div className={styles.desktopActions}>
          <LangSwitcher />
          {zaloUrl ? (
            <Button
              href={zaloUrl}
              variant="zalo"
              size="md"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="zalo" size={18} />
              {t("chatZalo")}
            </Button>
          ) : null}
          {hotline.tel ? (
            <Button
              href={hotline.tel}
              variant="primary"
              size="md"
              className={styles.hotlinePill}
            >
              <Icon name="phone" size={18} />
              {hotline.display}
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
