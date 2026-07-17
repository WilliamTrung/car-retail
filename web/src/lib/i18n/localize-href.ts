import { getPathname } from "./navigation";
import type { Locale } from "@/lib/view-models/common";

const STATIC_PATHS = new Set([
  "/",
  "/book-test-drive",
  "/deposit",
  "/news",
  "/about",
  "/contact",
  "/policies",
  "/support",
  "/showrooms",
]);

function isExternalHref(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href);
}

function splitPathAndQuery(href: string): { pathname: string; query?: Record<string, string> } {
  const q = href.indexOf("?");
  const pathname = q === -1 ? href : href.slice(0, q);
  if (q === -1) return { pathname };

  const params = new URLSearchParams(href.slice(q + 1));
  const query: Record<string, string> = {};
  for (const [k, v] of params) query[k] = v;
  return Object.keys(query).length ? { pathname, query } : { pathname };
}

export type LocalizeHref = (internalHref: string) => string;

/** Resolve canonical internal paths to locale-prefixed localized pathnames for plain `<a href>`. */
export function createLocalizeHref(locale: Locale): LocalizeHref {
  return (href: string): string => {
    if (!href || isExternalHref(href)) return href;

    const { pathname, query } = splitPathAndQuery(href);

    const modelsMatch = pathname.match(/^\/models\/([^/]+)$/);
    if (modelsMatch) {
      const slug = modelsMatch[1]!;
      return getPathname({
        locale,
        href: query
          ? { pathname: "/models/[slug]", params: { slug }, query }
          : { pathname: "/models/[slug]", params: { slug } },
      });
    }

    const newsMatch = pathname.match(/^\/news\/([^/]+)$/);
    if (newsMatch) {
      const slug = newsMatch[1]!;
      return getPathname({
        locale,
        href: query
          ? { pathname: "/news/[slug]", params: { slug }, query }
          : { pathname: "/news/[slug]", params: { slug } },
      });
    }

    if (STATIC_PATHS.has(pathname)) {
      return getPathname({
        locale,
        href: query
          ? { pathname: pathname as "/", query }
          : (pathname as "/"),
      });
    }

    return href;
  };
}
