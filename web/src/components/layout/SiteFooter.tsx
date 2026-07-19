import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import type { SiteChromeVM } from "@/lib/view-models";
import { toTelHref } from "@/lib/view-models";
import styles from "./SiteFooter.module.css";

type Props = {
  chrome: SiteChromeVM;
  /** From settings.brandStory / disclaimers — omit when empty */
  description?: string;
};

const SOCIAL_ICON: Record<SiteChromeVM["socials"][number]["kind"], IconName> = {
  facebook: "facebook",
  youtube: "youtube",
  zalo: "zalo",
  tiktok: "tiktok",
  instagram: "instagram",
};

/** Server trust footer — navy, responsive 4→2→1 cols. */
export async function SiteFooter({ chrome, description }: Props) {
  const t = await getTranslations("chrome");
  const {
    logoText,
    legal,
    socials,
    showrooms,
    footerLinks,
    hotline,
    zaloUrl,
    contactEmail,
    workingHours,
  } = chrome;

  const branches = showrooms.slice(0, 3);
  const hasLegal =
    Boolean(legal.companyName) || Boolean(legal.mst) || Boolean(legal.hqAddress);

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.col}>
          <p className={styles.brand}>
            <span className={styles.logoPrimary}>{logoText.primary}</span>
            {logoText.accent ? (
              <span className={styles.logoAccent}> {logoText.accent}</span>
            ) : null}
          </p>
          {description ? <p className={styles.blurb}>{description}</p> : null}
          {socials.length > 0 ? (
            <ul className={styles.socials}>
              {socials.map((s) => (
                <li key={s.kind}>
                  <a
                    href={s.url}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("socialAria", { network: s.kind })}
                  >
                    <Icon name={SOCIAL_ICON[s.kind]} size={18} />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {hasLegal ? (
            <div className={styles.legal}>
              {legal.companyName ? (
                <p className={styles.company}>{legal.companyName}</p>
              ) : null}
              {legal.mst ? (
                <p className={styles.muted}>{t("mstLabel", { mst: legal.mst })}</p>
              ) : null}
              {legal.hqAddress ? (
                <p className={styles.muted}>{legal.hqAddress}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        {branches.length > 0 ? (
          <div className={styles.col}>
            <h2 className={styles.heading}>{t("showroomDirectory")}</h2>
            <ul className={styles.branchList}>
              {branches.map((b) => (
                <li key={b.id} className={styles.branch}>
                  <div className={styles.branchHead}>
                    <span className={styles.branchName}>{b.name}</span>
                    <Chip variant="darkTag">{b.typeTag}</Chip>
                  </div>
                  {b.address ? (
                    <p className={styles.muted}>{b.address}</p>
                  ) : null}
                  {b.hotline ? (
                    <a href={toTelHref(b.hotline)} className={styles.branchTel}>
                      <Icon name="phone" size={14} />
                      {b.hotline}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {footerLinks.length > 0 ? (
          <div className={styles.col}>
            <h2 className={styles.heading}>{t("quickLinks")}</h2>
            <ul className={styles.linkList}>
              {footerLinks.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link href={item.href as "/"} className={styles.footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className={styles.col}>
          <h2 className={styles.heading}>{t("contact")}</h2>
          {hotline.tel ? (
            <a href={hotline.tel} className={styles.bigHotline}>
              {hotline.display}
            </a>
          ) : null}
          {workingHours ? (
            <p className={styles.hours}>
              <Icon name="clock" size={16} />
              {workingHours}
            </p>
          ) : null}
          {contactEmail ? (
            <a href={`mailto:${contactEmail}`} className={styles.email}>
              {contactEmail}
            </a>
          ) : null}
          {zaloUrl ? (
            <Button
              href={zaloUrl}
              variant="zalo"
              size="md"
              className={styles.zaloBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="zalo" size={18} />
              {t("zaloOa")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className={styles.bottomBar}>
        {legal.copyright ? (
          <p className={styles.copy}>{legal.copyright}</p>
        ) : (
          <p className={styles.copy}>
            {t("copyrightFallback", {
              year: new Date().getFullYear(),
              brand:
                legal.companyName ||
                [logoText.primary, logoText.accent].filter(Boolean).join(" "),
            })}
          </p>
        )}
        <div className={styles.legalLinks}>
          <Link href={"/policies" as "/"} className={styles.bottomLink}>
            {t("privacy")}
          </Link>
          <Link href={"/policies" as "/"} className={styles.bottomLink}>
            {t("terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
