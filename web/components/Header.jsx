"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { pickLocale } from "@/lib/attributes";
import styles from "./Header.module.css";

/** @param {Record<string, string | string[] | undefined>} routeParams */
function langSwitchHref(pathname, routeParams) {
  const params = { ...routeParams };
  delete params.locale;
  const keys = Object.keys(params).filter((k) => params[k] != null && params[k] !== "");
  if (!keys.length) return pathname;
  /** @type {Record<string, string>} */
  const normalized = {};
  for (const key of keys) {
    const value = params[key];
    normalized[key] = Array.isArray(value) ? value[0] : String(value);
  }
  return { pathname, params: normalized };
}

/**
 * @param {{
 *   dealerName?: string,
 *   logoUrl?: string,
 *   navItems?: { id: string, label: string, href: string }[],
 *   ctaTestDrive?: { label: { vi: string, en: string }, routeKey: string } | null,
 *   ctaDeposit?: { label: { vi: string, en: string }, routeKey: string } | null,
 *   locale?: string,
 *   primaryPhone?: string,
 *   email?: string,
 *   primaryShowroom?: string,
 *   openingHours?: string,
 * }} props
 */
export default function Header({
  dealerName,
  logoUrl,
  navItems = [],
  ctaTestDrive,
  ctaDeposit,
  locale: localeProp,
  primaryPhone,
  email,
  primaryShowroom,
  openingHours,
}) {
  const t = useTranslations("common");
  const locale = localeProp ?? useLocale();
  const pathname = usePathname();
  const routeParams = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const langHref = langSwitchHref(pathname, routeParams);
  const brand = dealerName || t("siteName");
  const cleanPhone = primaryPhone ? primaryPhone.replace(/\D/g, "") : "";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let ticking = false;
    /** @type {boolean | null} */
    let lastScrolled = null;

    function syncScrollState() {
      const y = window.scrollY;
      const nextScrolled =
        lastScrolled === null ? y > 64 : lastScrolled ? y > 8 : y > 64;

      if (nextScrolled !== lastScrolled) {
        lastScrolled = nextScrolled;
        setScrolled(nextScrolled);
      }
      ticking = false;
    }

    function handleScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(syncScrollState);
      }
    }

    syncScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={styles.header} data-scrolled={scrolled ? "true" : "false"}>
      {/* Top Bar (Hidden on Mobile) */}
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.topbarLeft}>
            {primaryShowroom && (
              <span className={styles.topbarItem}>
                <span className={styles.topbarIcon}>📍</span> {primaryShowroom}
              </span>
            )}
            {email && (
              <span className={styles.topbarItem}>
                <span className={styles.topbarIcon}>✉️</span> {email}
              </span>
            )}
          </div>
          <div className={styles.topbarRight}>
            {openingHours && (
              <span className={styles.topbarItem}>
                <span className={styles.topbarIcon}>⏰</span> {openingHours}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className={styles.navbar}>
        <div className={styles.navbarInner}>
          <Link href="/" className={styles.brand}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={brand} className={styles.logo} />
            ) : (
              <span className={styles.brandText}>{brand}</span>
            )}
          </Link>

          {/* Nav list - Center (Desktop) / Slide Drawer (Mobile) */}
          <nav id="site-nav" className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
            {navItems.map((item) => (
              <Link key={item.id} href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            ))}
            {ctaTestDrive ? (
              <Link href={ctaTestDrive.routeKey} className={`${styles.ctaSecondary} ${styles.mobileOnly}`}>
                {pickLocale(ctaTestDrive.label, locale)}
              </Link>
            ) : null}
            {ctaDeposit ? (
              <Link href={ctaDeposit.routeKey} className={`${styles.ctaPrimary} ${styles.mobileOnly}`}>
                {pickLocale(ctaDeposit.label, locale)}
              </Link>
            ) : null}
          </nav>

          {/* Right Controls */}
          <div className={styles.controls}>
            {/* Desktop Direct Call Hotline */}
            {primaryPhone && (
              <a href={`tel:${cleanPhone}`} className={styles.hotlineLink}>
                <span className={styles.hotlineIcon}>📞</span>
                <span className={styles.hotlineText}>{primaryPhone}</span>
              </a>
            )}

            {ctaTestDrive ? (
              <Link href={ctaTestDrive.routeKey} className={`${styles.ctaSecondary} ${styles.desktopOnly}`}>
                {pickLocale(ctaTestDrive.label, locale)}
              </Link>
            ) : null}
            {ctaDeposit ? (
              <Link href={ctaDeposit.routeKey} className={`${styles.ctaPrimary} ${styles.desktopOnly}`}>
                {pickLocale(ctaDeposit.label, locale)}
              </Link>
            ) : null}

            {/* Language Switcher */}
            <div className={styles.langSwitch}>
              <Link href={langHref} locale="vi" data-active={locale === "vi" ? "true" : "false"} className={styles.langLink}>
                VN
              </Link>
              <span className={styles.langDivider}>/</span>
              <Link href={langHref} locale="en" data-active={locale === "en" ? "true" : "false"} className={styles.langLink}>
                EN
              </Link>
            </div>

            {/* Mobile Hamburger menu toggle button */}
            <button
              type="button"
              className={styles.menuToggle}
              aria-expanded={menuOpen}
              aria-controls="site-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className={styles.menuIcon} aria-hidden="true" />
              <span className={styles.menuLabel}>{menuOpen ? t("menuClose") : t("menuOpen")}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
