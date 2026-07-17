import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import sectionStyles from "@/components/PageSection.module.css";
import { pickLocale } from "@/lib/attributes";
import { getPageByType, getSiteSettings } from "@/lib/queries/public";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [page, settings] = await Promise.all([
    getPageByType("about"),
    getSiteSettings(),
  ]);
  if (!page) notFound();

  const title = pickLocale(page.title, locale);
  const body = pickLocale(page.body, locale);
  const brandStory = settings?.brandStory;
  const storyLocale = brandStory?.[locale as "vi" | "en"] ?? brandStory?.vi;
  const storyTitle = storyLocale?.title ?? "";
  const storyBody = storyLocale?.body ?? "";

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
