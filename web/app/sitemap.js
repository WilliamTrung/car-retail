import prisma from "@/lib/prisma";
import { getSiteUrl, localePath } from "@/lib/seo";
import { pickLocale } from "@/lib/attributes";

export default async function sitemap() {
  const base = getSiteUrl();
  const now = new Date();

  const staticPaths = [
    "/",
    "/book-test-drive",
    "/deposit",
    "/news",
    "/about",
    "/contact",
    "/policies",
    "/support",
  ];

  /** @type {{ url: string, lastModified: Date, changeFrequency: string, priority: number }[]} */
  const entries = [];

  for (const locale of ["vi", "en"]) {
    for (const path of staticPaths) {
      entries.push({
        url: localePath(locale, path),
        lastModified: now,
        changeFrequency: path === "/" ? "daily" : "weekly",
        priority: path === "/" ? 1 : 0.7,
      });
    }
  }

  const models = await prisma.vehicleModel.findMany({ where: { published: true } });
  for (const model of models) {
    for (const locale of ["vi", "en"]) {
      const slug = pickLocale(model.slug, locale);
      if (!slug) continue;
      entries.push({
        url: localePath(locale, `/models/${slug}`),
        lastModified: model.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  const posts = await prisma.newsPost.findMany({ where: { published: true } });
  for (const post of posts) {
    for (const locale of ["vi", "en"]) {
      const slug = pickLocale(post.slug, locale);
      if (!slug) continue;
      entries.push({
        url: localePath(locale, `/news/${slug}`),
        lastModified: post.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
