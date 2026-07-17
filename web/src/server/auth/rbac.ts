import type { AdminRole } from "@prisma/client";

export type { AdminRole };

/** Admin panel modules gated by role. */
export type AdminModule =
  | "dashboard"
  | "settings"
  | "navigation"
  | "units"
  | "templates"
  | "models"
  | "media"
  | "homepage"
  | "news"
  | "pages"
  | "showrooms"
  | "leads";

/** Which roles may access each admin module. */
export const MODULE_ROLES: Record<AdminModule, readonly AdminRole[]> = {
  dashboard: ["SUPER_ADMIN", "EDITOR", "SALES"],
  settings: ["SUPER_ADMIN"],
  navigation: ["SUPER_ADMIN"],
  units: ["SUPER_ADMIN", "EDITOR"],
  templates: ["SUPER_ADMIN", "EDITOR"],
  models: ["SUPER_ADMIN", "EDITOR"],
  media: ["SUPER_ADMIN", "EDITOR"],
  homepage: ["SUPER_ADMIN", "EDITOR"],
  news: ["SUPER_ADMIN", "EDITOR"],
  pages: ["SUPER_ADMIN", "EDITOR"],
  showrooms: ["SUPER_ADMIN", "EDITOR"],
  leads: ["SUPER_ADMIN", "EDITOR", "SALES"],
};

/** True if `role` may access `module`. Unknown modules → false. */
export function canAccess(
  role: AdminRole | undefined | null,
  module: string,
): boolean {
  if (!role) return false;
  const allowed = MODULE_ROLES[module as AdminModule];
  return allowed ? allowed.includes(role) : false;
}

/** True if `role` is one of `roles`. */
export function hasRole(
  role: AdminRole | undefined | null,
  roles: readonly AdminRole[],
): boolean {
  return !!role && roles.includes(role);
}
