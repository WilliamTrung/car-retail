import type { MetadataRoute } from "next";
import { pickLocale } from "@/lib/attributes";
import { localePath } from "@/lib/seo";
import { contentService } from "@/server/modules/content";
import { vehiclesService } from "@/server/modules/vehicles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of ["vi", "en"] as const) {
    for (const path of staticPaths) {
      entries.push({
        url: localePath(locale, path),
        lastModified: now,
        changeFrequency: path === "/" ? "daily" : "weekly",
        priority: path === "/" ? 1 : 0.7,
      });
    }
  }

  const [models, posts] = await Promise.all([
    vehiclesService.getPublishedModels(),
    contentService.getAllNews(),
  ]);

  for (const model of models) {
    for (const locale of ["vi", "en"] as const) {
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

  for (const post of posts) {
    for (const locale of ["vi", "en"] as const) {
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
