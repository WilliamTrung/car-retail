"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/lib/i18n/navigation";
import styles from "./FloatingContact.module.css";

/**
 * @param {{
 *   locale: string,
 *   primaryPhone?: string,
 *   testDriveRoute?: string,
 * }} props
 */
export default function FloatingContact({ locale, primaryPhone = "", testDriveRoute = "/book-test-drive" }) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const pathname = usePathname();
  const hasStickyBar = /\/models\//.test(pathname);

  // Clean the phone number for tel: link and Zalo link
  const cleanPhone = primaryPhone ? primaryPhone.replace(/\D/g, "") : "";
  const zaloUrl = cleanPhone ? `https://zalo.me/${cleanPhone}` : null;
  const telUrl = cleanPhone ? `tel:${cleanPhone}` : null;

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 300);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className={styles.container}>
      {/* Floating Action Column - Bottom Left */}
      <div className={`${styles.widgets} ${hasStickyBar ? styles.widgetsAboveSticky : ""}`}>
        {telUrl && (
          <a
            href={telUrl}
            className={`${styles.widget} ${styles.phoneWidget}`}
            title="Gọi ngay"
            aria-label="Call Hotline"
          >
            <span className={styles.pulseRing} />
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className={styles.widgetText}>{primaryPhone}</span>
          </a>
        )}

        {zaloUrl && (
          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.widget} ${styles.zaloWidget}`}
            title="Chat Zalo"
            aria-label="Chat Zalo"
          >
            <span className={styles.zaloLabel}>Zalo</span>
          </a>
        )}

        <Link
          href={testDriveRoute}
          className={`${styles.widget} ${styles.testDriveWidget}`}
          title="Đăng ký lái thử"
          aria-label="Book Test Drive"
        >
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </Link>
      </div>

      {/* Back to Top button - Bottom Right */}
      <button
        type="button"
        className={`${styles.scrollTop} ${showScrollTop ? styles.scrollTopVisible : ""} ${hasStickyBar ? styles.scrollTopAboveSticky : ""}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Về đầu trang"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.icon}
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </div>
  );
}
