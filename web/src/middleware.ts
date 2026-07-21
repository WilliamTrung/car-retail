import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import {
  isAdminLoginPath,
  matchLocaleAdminPath,
  resolveAdminRedirectLocale,
} from "@/lib/i18n/admin-locale";
import { routing } from "@/lib/i18n/routing";

const intlMiddleware = createMiddleware(routing);

/** Auth.js v5 session cookie names (database strategy stores sessionToken). */
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
] as const;

function hasSessionCookie(req: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => req.cookies.has(name));
}

/**
 * Combined middleware:
 * - Bare `/admin/**` → **307** to `/{locale}/admin/...` (before auth).
 * - `/{locale}/admin/**` (except login): redirect unauth to
 *   `/{locale}/admin/login?callbackUrl=…`. Cookie present → `next()` (no intl).
 * - Public locale routes: next-intl.
 * - `/api/**` stays open (matcher excludes `api`).
 */
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bare /admin → locale-prefixed admin (preserve path + query). Temporary redirect.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const locale = resolveAdminRedirectLocale(req);
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url, 307);
  }

  const localeAdmin = matchLocaleAdminPath(pathname);
  if (localeAdmin) {
    const { locale, adminPath } = localeAdmin;
    if (!isAdminLoginPath(adminPath) && !hasSessionCookie(req)) {
      const login = req.nextUrl.clone();
      login.pathname = `/${locale}/admin/login`;
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    // Skip intlMiddleware (no admin pathnames) but still publish the URL
    // locale so getLocale()/server actions resolve correctly (not defaultLocale).
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-next-intl-locale", locale);
    const res = NextResponse.next({
      request: { headers: requestHeaders },
    });
    res.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "lax" });
    return res;
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/",
    "/(vi|en)/:path*",
    "/admin",
    "/admin/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
