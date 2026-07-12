import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pickLocale } from "@/lib/attributes";
import sectionStyles from "@/components/PageSection.module.css";
import { getPageByType, getSiteSettings } from "@/lib/queries/public";

export default async function AboutPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [page, settings] = await Promise.all([getPageByType("about"), getSiteSettings()]);
  if (!page) notFound();

  const title = pickLocale(page.title, locale);
  const body = pickLocale(page.body, locale);
  const brandStory = /** @type {{ vi?: { title?: string, body?: string }, en?: { title?: string, body?: string } }} */ (
    settings?.brandStory ?? {}
  );
  const storyTitle = pickLocale(
    { vi: brandStory.vi?.title, en: brandStory.en?.title },
    locale
  );
  const storyBody = pickLocale(
    { vi: brandStory.vi?.body, en: brandStory.en?.body },
    locale
  );

  return (
    <article className={sectionStyles.pageHeader}>
      <h1>{title}</h1>
      <div className={sectionStyles.prose}>
        {body.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      {storyTitle || storyBody ? (
        <div className={sectionStyles.prose}>
          {storyTitle ? <h2>{storyTitle}</h2> : null}
          {storyBody
            ? storyBody.split("\n").map((line, i) => (
                <p key={`story-${i}`}>{line}</p>
              ))
            : null}
        </div>
      ) : null}
    </article>
  );
}
