import { revalidateTag } from "next/cache";

/** @param {string[]} tags */
export function bustTags(...tags) {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

export const TAGS = {
  siteSettings: "site-settings",
  menu: "menu",
  units: "units",
  models: "models",
  hero: "hero",
  services: "services",
  news: "news",
  pages: "pages",
  policies: "policies",
  faqs: "faqs",
  showrooms: "showrooms",
  hotlines: "hotlines",
};
