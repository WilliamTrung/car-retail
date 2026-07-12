/** @typedef {'SUPER_ADMIN' | 'EDITOR' | 'SALES'} AdminRole */

/** @type {Record<string, AdminRole[]>} */
export const MODULE_ROLES = {
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

/** @param {AdminRole | undefined} role @param {string} module */
export function canAccess(role, module) {
  if (!role) return false;
  const allowed = MODULE_ROLES[module];
  return allowed ? allowed.includes(role) : false;
}

/** @param {AdminRole | undefined} role @param {AdminRole[]} roles */
export function hasRole(role, roles) {
  return !!role && roles.includes(role);
}
