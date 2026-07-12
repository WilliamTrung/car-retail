import { pickLocale } from "@/lib/attributes";
import { getHotlines, getMenuItems, getShowrooms, getSiteSettings } from "@/lib/queries/public";
import { Link } from "@/lib/i18n/navigation";
import styles from "./Footer.module.css";

/**
 * @param {{ locale: string }} props
 */
export default async function Footer({ locale }) {
  const [settings, showrooms, hotlines, footerMenu] = await Promise.all([
    getSiteSettings(),
    getShowrooms(),
    getHotlines(),
    getMenuItems("FOOTER"),
  ]);

  const dealerName = settings ? pickLocale(settings.dealerName, locale) : "";
  const legalEntity = settings ? pickLocale(settings.legalEntity, locale) : "";
  const copyright = settings ? pickLocale(settings.copyright, locale) : "";
  const siteDescription = settings ? pickLocale(settings.disclaimers, locale) : "";
  const email = settings?.email ?? "";
  const socialLinks = /** @type {{ platform: string, url: string }[]} */ (settings?.socialLinks ?? []);
  const primaryHotline = hotlines[0];

  const footerLinks = footerMenu.map((item) => ({
    id: item.id,
    label: pickLocale(item.label, locale),
    href: item.routeKey,
  }));

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.infoCol}>
          <p className={styles.brand}>{dealerName}</p>
          {legalEntity && <p className={styles.companyName}>{legalEntity}</p>}
          {settings?.mst && <p className={styles.muted}>MST: {settings.mst}</p>}

          <div className={styles.contactList}>
            {email && (
              <p className={styles.contactItem}>
                <span className={styles.icon}>✉️</span> {email}
              </p>
            )}
            {primaryHotline && (
              <p className={styles.contactItem}>
                <span className={styles.icon}>📞</span>{" "}
                <a href={`tel:${primaryHotline.phone.replace(/\D/g, "")}`} className={styles.hotlineLink}>
                  {primaryHotline.phone}
                </a>
                {pickLocale(primaryHotline.label, locale) ? (
                  <span className={styles.hotlineSuffix}> ({pickLocale(primaryHotline.label, locale)})</span>
                ) : null}
              </p>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div className={styles.socialLinks}>
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  {link.platform}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className={styles.showroomsCol}>
          <h3 className={styles.heading}>{locale === "vi" ? "HỆ THỐNG SHOWROOM" : "SHOWROOM NETWORK"}</h3>
          <ul className={styles.list}>
            {showrooms.map((s) => (
              <li key={s.id} className={styles.showroomLi}>
                <span className={styles.showroomName}>
                  📍 {pickLocale(s.name, locale)}
                  {s.typeTag ? <span className={styles.typeBadge}>{s.typeTag}</span> : ""}
                </span>
                <span className={styles.showroomAddr}>{pickLocale(s.address, locale)}</span>
                {s.phone ? <span className={styles.showroomPhone}>{s.phone}</span> : null}
                {s.hours ? (
                  <span className={styles.showroomHours}>{pickLocale(s.hours, locale)}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.hotlinesCol}>
          <h3 className={styles.heading}>{locale === "vi" ? "ĐƯỜNG DÂY NÓNG" : "HOTLINES"}</h3>
          <ul className={styles.list}>
            {hotlines.map((h) => (
              <li key={h.id} className={styles.hotlineLi}>
                <span className={styles.hotlineLabel}>{pickLocale(h.label, locale)}:</span>
                <a href={`tel:${h.phone.replace(/\D/g, "")}`} className={styles.phoneLink}>
                  {h.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.linksCol}>
          <h3 className={styles.heading}>{locale === "vi" ? "HỖ TRỢ KHÁCH HÀNG" : "QUICK LINKS"}</h3>
          <ul className={styles.linksList}>
            {footerLinks.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className={styles.footerLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.copyrightBar}>
        <div className={styles.copyInner}>
          <p className={styles.copyText}>
            {copyright || `© ${new Date().getFullYear()} ${dealerName}. All rights reserved.`}
          </p>
          {siteDescription ? <p className={styles.creditText}>{siteDescription}</p> : null}
        </div>
      </div>
    </footer>
  );
}
