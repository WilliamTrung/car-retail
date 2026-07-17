import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

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
 * - `/admin/**` (except login): redirect to `/admin/login` when no Auth.js cookie.
 *   Cookie presence ≠ valid login — deleted `Session` rows are enforced in
 *   `auth()` / `requireAdmin` (Node + Prisma). Edge only gates the cookie.
 * - Public locale routes: next-intl.
 * - `/api/**` stays open (matcher excludes `api`).
 */
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isLogin =
      pathname === "/admin/login" || pathname.startsWith("/admin/login/");
    if (!isLogin && !hasSessionCookie(req)) {
      const login = req.nextUrl.clone();
      login.pathname = "/admin/login";
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
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
