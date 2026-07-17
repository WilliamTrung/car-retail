/**
 * Auth / RBAC / session live in `src/server/auth/` — not duplicated as a
 * layered domain module. Thin re-export so consumers can import from
 * `@/server/modules/auth` or `@/server/auth`.
 */

export { auth, handlers, signIn, signOut } from "@/server/auth";

export {
  requireAdmin,
  requireAdminOrThrow,
  getSession,
  UnauthorizedError,
  ForbiddenError,
  type AdminSession,
} from "@/server/auth/session";

export {
  canAccess,
  hasRole,
  MODULE_ROLES,
  type AdminModule,
  type AdminRole,
} from "@/server/auth/rbac";

export { hashPassword, verifyPassword } from "@/server/auth/password";

export { loginAction, logoutAction, type LoginState } from "@/server/auth/actions";
