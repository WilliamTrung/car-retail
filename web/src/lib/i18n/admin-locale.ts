import { hasLocale } from "next-intl";
import type { NextRequest } from "next/server";

import { routing } from "@/lib/i18n/routing";

/**
 * Locale for bare `/admin/**` redirects:
 * NEXT_LOCALE cookie → Accept-Language → defaultLocale.
 */
export function resolveAdminRedirectLocale(req: NextRequest): string {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && hasLocale(routing.locales, cookie)) {
    return cookie;
  }

  const header = req.headers.get("accept-language");
  if (header) {
    for (const part of header.split(",")) {
      const tag = part.trim().split(";")[0]?.toLowerCase();
      if (!tag) continue;
      if (hasLocale(routing.locales, tag)) return tag;
      const base = tag.split("-")[0];
      if (base && hasLocale(routing.locales, base)) return base;
    }
  }

  return routing.defaultLocale;
}

const LOCALE_ADMIN_RE = /^\/(vi|en)(\/admin(?:\/.*)?)$/;

/** Match `/{vi|en}/admin...` — returns locale + adminPath or null. */
export function matchLocaleAdminPath(
  pathname: string,
): { locale: string; adminPath: string } | null {
  const match = LOCALE_ADMIN_RE.exec(pathname);
  if (!match) return null;
  return { locale: match[1]!, adminPath: match[2]! };
}

export function isAdminLoginPath(adminPath: string): boolean {
  return (
    adminPath === "/admin/login" || adminPath.startsWith("/admin/login/")
  );
}
