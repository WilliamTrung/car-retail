import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { pickLocale } from "@/lib/attributes";

const REVALIDATE = 300;

/** Prisma Decimal is not serializable to client components or unstable_cache. */
function serializeVariants(variants) {
  return variants.map((variant) => ({
    ...variant,
    price: variant.price != null ? Number(variant.price) : null,
  }));
}

function serializeModels(models) {
  return models.map((model) => ({
    ...model,
    variants: serializeVariants(model.variants ?? []),
  }));
}

export const getSiteSettings = unstable_cache(
  () =>
    prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      include: { logoMedia: true, faviconMedia: true },
    }),
  ["public-site-settings", "v3"],
  { revalidate: REVALIDATE, tags: ["site-settings"] }
);

export async function getMenuItems(placement) {
  return unstable_cache(
    () =>
      prisma.menuItem.findMany({
        where: { placement, visible: true },
        orderBy: { sortOrder: "asc" },
      }),
    ["public-menu", placement, "v2"],
    { revalidate: REVALIDATE, tags: ["menu"] }
  )();
}

export const getUnits = unstable_cache(
  () => prisma.unit.findMany({ orderBy: { key: "asc" } }),
  ["public-units"],
  { revalidate: REVALIDATE, tags: ["units"] }
);

export const getPublishedModels = unstable_cache(
  async () => {
    const models = await prisma.vehicleModel.findMany({
      where: { published: true },
      include: {
        heroMedia: true,
        variants: {
          where: { published: true },
          orderBy: { sortOrder: "asc" },
        },
        segment: { include: { line: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
    return serializeModels(models);
  },
  ["public-models", "v5"],
  { revalidate: REVALIDATE, tags: ["models"] }
);

export const getHeroSlides = unstable_cache(
  () =>
    prisma.heroSlide.findMany({
      where: { published: true },
      include: { imageMedia: true },
      orderBy: { sortOrder: "asc" },
    }),
  ["public-hero-slides", "v5"],
  { revalidate: REVALIDATE, tags: ["hero"] }
);

export const getServiceBlocks = unstable_cache(
  () =>
    prisma.serviceBlock.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
  ["public-service-blocks"],
  { revalidate: REVALIDATE, tags: ["services"] }
);

export async function getFeaturedNews(limit = 3) {
  return unstable_cache(
    () =>
      prisma.newsPost.findMany({
        where: { published: true },
        include: { featuredMedia: true },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        take: limit,
      }),
    ["public-news-featured", String(limit), "v3"],
    { revalidate: REVALIDATE, tags: ["news"] }
  )();
}

export const getAllNews = unstable_cache(
  () =>
    prisma.newsPost.findMany({
      where: { published: true },
      include: { featuredMedia: true },
      orderBy: { publishedAt: "desc" },
    }),
  ["public-news-all", "v3"],
  { revalidate: REVALIDATE, tags: ["news"] }
);

export const getShowrooms = unstable_cache(
  () =>
    prisma.showroom.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
  ["public-showrooms", "v2"],
  { revalidate: REVALIDATE, tags: ["showrooms"] }
);

export const getHotlines = unstable_cache(
  () => prisma.hotline.findMany({ orderBy: { sortOrder: "asc" } }),
  ["public-hotlines", "v2"],
  { revalidate: REVALIDATE, tags: ["hotlines"] }
);

export const getGlobalFaqs = unstable_cache(
  () =>
    prisma.faqItem.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
  ["public-faqs"],
  { revalidate: REVALIDATE, tags: ["faqs"] }
);

export const getPolicies = unstable_cache(
  () =>
    prisma.policyDocument.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
  ["public-policies"],
  { revalidate: REVALIDATE, tags: ["policies"] }
);

export async function getPageByType(pageType) {
  return unstable_cache(
    () => prisma.page.findFirst({ where: { pageType, published: true } }),
    [`public-page-${pageType}`],
    { revalidate: REVALIDATE, tags: ["pages"] }
  )();
}

export async function getModelBySlug(locale, slug) {
  const models = await getPublishedModels();
  return models.find((m) => pickLocale(m.slug, locale) === slug) ?? null;
}

export async function getNewsBySlug(locale, slug) {
  const posts = await getAllNews();
  return posts.find((p) => pickLocale(p.slug, locale) === slug) ?? null;
}

export async function getModelWithDetails(id) {
  return unstable_cache(
    async () => {
      const model = await prisma.vehicleModel.findUnique({
        where: { id },
        include: {
          heroMedia: true,
          variants: { where: { published: true }, orderBy: { sortOrder: "asc" } },
          featureSections: {
            orderBy: { sortOrder: "asc" },
            include: { imageMedia: true },
          },
          faqs: { orderBy: { sortOrder: "asc" } },
          segment: { include: { line: true } },
        },
      });
      if (!model) return null;
      return { ...model, variants: serializeVariants(model.variants ?? []) };
    },
    [`public-model-${id}`, "v3"],
    { revalidate: REVALIDATE, tags: ["models"] }
  )();
}
