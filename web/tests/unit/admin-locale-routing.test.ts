import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { adminHref } from "@/app/[locale]/(admin)/admin/(panel)/_lib/nav";
import {
  isAdminLoginPath,
  matchLocaleAdminPath,
  resolveAdminRedirectLocale,
} from "@/lib/i18n/admin-locale";

function adminReq(
  path: string,
  init?: { cookie?: string; acceptLanguage?: string },
): NextRequest {
  const headers = new Headers();
  if (init?.cookie) headers.set("cookie", init.cookie);
  if (init?.acceptLanguage) headers.set("accept-language", init.acceptLanguage);
  return new NextRequest(new URL(path, "http://localhost:3000"), { headers });
}

describe("adminHref", () => {
  it("prefixes /admin paths with locale", () => {
    expect(adminHref("vi", "/admin")).toBe("/vi/admin");
    expect(adminHref("en", "/admin/settings")).toBe("/en/admin/settings");
  });
});

describe("admin locale middleware helpers", () => {
  it("C1 shape: bare /admin path + locale → /{locale}/admin… (307 target)", () => {
    const pathname = "/admin/settings";
    const locale = resolveAdminRedirectLocale(adminReq(pathname));
    expect(locale).toBe("vi");
    expect(`/${locale}${pathname}`).toBe("/vi/admin/settings");
    // Status: middleware uses NextResponse.redirect(url, 307) — see src/middleware.ts
  });

  it("uses NEXT_LOCALE cookie over Accept-Language for bare /admin", () => {
    const locale = resolveAdminRedirectLocale(
      adminReq("/admin/login", {
        cookie: "NEXT_LOCALE=en",
        acceptLanguage: "vi",
      }),
    );
    expect(locale).toBe("en");
  });

  it("negotiates Accept-Language when no cookie", () => {
    expect(
      resolveAdminRedirectLocale(
        adminReq("/admin", { acceptLanguage: "en-US,en;q=0.9" }),
      ),
    ).toBe("en");
  });

  it("D1: matchLocaleAdminPath for /vi/admin/**", () => {
    expect(matchLocaleAdminPath("/vi/admin/settings")).toEqual({
      locale: "vi",
      adminPath: "/admin/settings",
    });
    expect(isAdminLoginPath("/admin/login")).toBe(true);
    expect(isAdminLoginPath("/admin/settings")).toBe(false);
  });

  it("D2: matchLocaleAdminPath for /en/admin/**", () => {
    expect(matchLocaleAdminPath("/en/admin/media")).toEqual({
      locale: "en",
      adminPath: "/admin/media",
    });
  });
});
