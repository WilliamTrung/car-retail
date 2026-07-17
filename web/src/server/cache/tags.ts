import { revalidateTag, unstable_cache } from "next/cache";

/** Single typed tag registry — the only cache invalidation keys. */
export const TAGS = {
  siteSettings: "site-settings",
  menu: "menu",
  units: "units",
  models: "models",
  hero: "hero",
  delivery: "delivery",
  services: "services",
  news: "news",
  pages: "pages",
  policies: "policies",
  faqs: "faqs",
  showrooms: "showrooms",
  hotlines: "hotlines",
} as const;

export type CacheTag = (typeof TAGS)[keyof typeof TAGS];

export function revalidateTags(...tags: CacheTag[]): void {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

const REVALIDATE_SECONDS = 300;

/**
 * Cached read over Next.js Data Cache (`unstable_cache`).
 * Pass registry tags only — no Map cache, no version-suffix keys.
 */
export function cachedRead<T>(
  keyParts: string[],
  fn: () => Promise<T>,
  tags: CacheTag[],
): Promise<T> {
  return unstable_cache(fn, keyParts, {
    tags,
    revalidate: REVALIDATE_SECONDS,
  })();
}
