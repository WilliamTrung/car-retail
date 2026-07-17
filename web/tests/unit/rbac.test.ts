import { describe, expect, it } from "vitest";

import { canAccess, hasRole, MODULE_ROLES } from "@/server/auth/rbac";

describe("canAccess", () => {
  it("allows SUPER_ADMIN on settings and leads", () => {
    expect(canAccess("SUPER_ADMIN", "settings")).toBe(true);
    expect(canAccess("SUPER_ADMIN", "leads")).toBe(true);
    expect(canAccess("SUPER_ADMIN", "dashboard")).toBe(true);
  });

  it("blocks EDITOR and SALES from settings", () => {
    expect(canAccess("EDITOR", "settings")).toBe(false);
    expect(canAccess("SALES", "settings")).toBe(false);
  });

  it("allows SALES only on dashboard + leads among common modules", () => {
    expect(canAccess("SALES", "leads")).toBe(true);
    expect(canAccess("SALES", "dashboard")).toBe(true);
    expect(canAccess("SALES", "models")).toBe(false);
    expect(canAccess("SALES", "media")).toBe(false);
    expect(canAccess("SALES", "news")).toBe(false);
    expect(canAccess("SALES", "navigation")).toBe(false);
  });

  it("allows EDITOR on content modules but not navigation", () => {
    expect(canAccess("EDITOR", "models")).toBe(true);
    expect(canAccess("EDITOR", "leads")).toBe(true);
    expect(canAccess("EDITOR", "navigation")).toBe(false);
  });

  it("returns false for missing role or unknown module", () => {
    expect(canAccess(undefined, "leads")).toBe(false);
    expect(canAccess(null, "leads")).toBe(false);
    expect(canAccess("SUPER_ADMIN", "not-a-module")).toBe(false);
  });
});

describe("hasRole", () => {
  it("matches listed roles", () => {
    expect(hasRole("SALES", ["SUPER_ADMIN", "SALES"])).toBe(true);
    expect(hasRole("EDITOR", ["SUPER_ADMIN", "SALES"])).toBe(false);
    expect(hasRole(undefined, ["SUPER_ADMIN"])).toBe(false);
  });
});

describe("MODULE_ROLES", () => {
  it("keeps settings SUPER_ADMIN-only", () => {
    expect(MODULE_ROLES.settings).toEqual(["SUPER_ADMIN"]);
  });
});
