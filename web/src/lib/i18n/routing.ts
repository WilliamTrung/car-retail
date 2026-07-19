import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/models": {
      vi: "/models",
      en: "/models",
    },
    "/models/[slug]": {
      vi: "/models/[slug]",
      en: "/models/[slug]",
    },
    "/promotions": {
      vi: "/khuyen-mai",
      en: "/promotions",
    },
    "/book-test-drive": {
      vi: "/dang-ky-lai-thu",
      en: "/book-test-drive",
    },
    "/deposit": {
      vi: "/dat-coc",
      en: "/deposit",
    },
    "/news": {
      vi: "/tin-tuc",
      en: "/news",
    },
    "/news/[slug]": {
      vi: "/tin-tuc/[slug]",
      en: "/news/[slug]",
    },
    "/about": {
      vi: "/ve-chung-toi",
      en: "/about",
    },
    "/contact": {
      vi: "/lien-he",
      en: "/contact",
    },
    "/policies": {
      vi: "/chinh-sach",
      en: "/policies",
    },
    "/support": {
      vi: "/ho-tro",
      en: "/support",
    },
    "/showrooms": {
      vi: "/showroom",
      en: "/showrooms",
    },
  },
});

export const { locales, defaultLocale } = routing;
