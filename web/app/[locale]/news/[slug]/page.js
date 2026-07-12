import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pickLocale } from "@/lib/attributes";
import sectionStyles from "@/components/PageSection.module.css";
import { routing } from "@/lib/i18n/routing";
import { getAllNews, getNewsBySlug, getSiteSettings } from "@/lib/queries/public";
import { buildPageMetadata, resolveMediaUrl, resolveOgImageUrl } from "@/lib/seo";

export async function generateStaticParams() {
  const posts = await getAllNews();
  return routing.locales.flatMap((locale) =>
    posts.map((post) => ({
      locale,
      slug: pickLocale(post.slug, locale),
    }))
  );
}

/** @param {{ params: Promise<{ locale: string, slug: string }> }} props */
export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const post = await getNewsBySlug(locale, slug);
  if (!post) return {};

  const settings = await getSiteSettings();
  const title = pickLocale(post.title, locale);
  const excerpt = pickLocale(post.excerpt, locale);
  const postMeta = /** @type {{ vi?: { title?: string, description?: string, ogImageMediaId?: string }, en?: { title?: string, description?: string, ogImageMediaId?: string } } | null | undefined} */ (
    post.meta
  );
  const ogFromMeta = await resolveOgImageUrl(locale, settings?.seoDefaults, postMeta);
  const ogFromFeatured = await resolveMediaUrl(post.featuredMediaId);
  const ogImageUrl = ogFromMeta || ogFromFeatured;

  return buildPageMetadata(
    locale,
    `/news/${slug}`,
    postMeta ?? { [locale]: { title, description: excerpt } },
    settings?.seoDefaults,
    ogImageUrl
  );
}

export default async function NewsDetailPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getNewsBySlug(locale, slug);
  if (!post) notFound();

  const title = pickLocale(post.title, locale);
  const body = pickLocale(post.body, locale);

  return (
    <article className={sectionStyles.pageHeader}>
      <h1>{title}</h1>
      <div className={sectionStyles.prose}>
        {body.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </article>
  );
}
