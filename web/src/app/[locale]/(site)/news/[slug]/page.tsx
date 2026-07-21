import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import sectionStyles from "@/components/PageSection.module.css";
import { SlugAlternates } from "@/components/ui/SlugAlternates";
import { pickLocale } from "@/lib/attributes";
import { routing } from "@/lib/i18n/routing";
import {
  getAllNews,
  getNewsBySlug,
  getSiteSettings,
} from "@/lib/queries/public";
import {
  buildPageMetadata,
  resolveMediaUrl,
  resolveOgImageUrl,
} from "@/lib/seo";

export async function generateStaticParams() {
  const posts = await getAllNews();
  return routing.locales.flatMap((locale) =>
    posts.map((post) => ({
      locale,
      slug: pickLocale(post.slug, locale),
    })),
  );
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getNewsBySlug(locale, slug);
  if (!post) return {};

  const settings = await getSiteSettings();
  const title = pickLocale(post.title, locale);
  const excerpt = pickLocale(post.excerpt, locale);
  const ogFromMeta = await resolveOgImageUrl(
    locale,
    settings?.seoDefaults,
    post.meta,
  );
  const ogFromFeatured = await resolveMediaUrl(post.featuredMediaId);
  const ogImageUrl = ogFromMeta || ogFromFeatured;

  return buildPageMetadata(
    locale,
    `/news/${slug}`,
    post.meta ?? { [locale]: { title, description: excerpt } },
    settings?.seoDefaults,
    ogImageUrl,
  );
}

export default async function NewsDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getNewsBySlug(locale, slug);
  if (!post) notFound();

  const title = pickLocale(post.title, locale);
  const body = pickLocale(post.body, locale);

  return (
    <article className={sectionStyles.pageHeader}>
      {/* News slugs are locale-specific — register both so LangSwitcher
          links to the counterpart article instead of a 404. */}
      <SlugAlternates
        vi={pickLocale(post.slug, "vi")}
        en={pickLocale(post.slug, "en")}
      />
      <h1>{title}</h1>
      <div className={sectionStyles.prose}>
        {body.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </article>
  );
}
