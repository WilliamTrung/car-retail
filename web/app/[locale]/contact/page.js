import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pickLocale } from "@/lib/attributes";
import sectionStyles from "@/components/PageSection.module.css";
import { getHotlines, getPageByType, getShowrooms, getSiteSettings } from "@/lib/queries/public";

export default async function ContactPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [page, settings, showrooms, hotlines] = await Promise.all([
    getPageByType("contact"),
    getSiteSettings(),
    getShowrooms(),
    getHotlines(),
  ]);
  if (!page) notFound();

  const title = pickLocale(page.title, locale);
  const body = pickLocale(page.body, locale);

  return (
    <article className={sectionStyles.pageHeader}>
      <h1>{title}</h1>
      <div className={sectionStyles.prose}>
        {body.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
        {settings?.email ? <p>Email: {settings.email}</p> : null}
      </div>
      <div className={sectionStyles.prose}>
        <h2>{locale === "vi" ? "Showroom" : "Showrooms"}</h2>
        <ul>
          {showrooms.map((s) => (
            <li key={s.id}>
              <strong>{pickLocale(s.name, locale)}</strong> — {pickLocale(s.address, locale)}
              {s.phone ? ` — ${s.phone}` : ""}
            </li>
          ))}
        </ul>
        <h2>Hotline</h2>
        <ul>
          {hotlines.map((h) => (
            <li key={h.id}>
              {pickLocale(h.label, locale)}: {h.phone}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
