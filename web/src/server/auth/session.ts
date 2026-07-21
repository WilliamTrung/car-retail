import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

import { auth } from "@/server/auth";
import { canAccess, type AdminModule } from "@/server/auth/rbac";
import type { SessionUser } from "@/server/auth/types";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Current Auth.js session, or `null` if anonymous / revoked. */
export async function getSession(): Promise<Session | null> {
  return auth();
}

export type AdminSession = Session & {
  user: SessionUser;
};

/**
 * Require an authenticated admin. Optional `module` gates by RBAC.
 * - Unauthenticated → redirect `/{locale}/admin/login` (Server Components / Actions).
 * - Authenticated but wrong role → `ForbiddenError`.
 */
export async function requireAdmin(
  module?: AdminModule,
): Promise<AdminSession> {
  const session = await auth();
  if (!session?.user?.id) {
    const locale = await getLocale();
    redirect(`/${locale}/admin/login`);
  }

  const role = session.user.role;
  if (module && !canAccess(role, module)) {
    throw new ForbiddenError(
      `Role ${role ?? "unknown"} cannot access module "${module}"`,
    );
  }

  return session as AdminSession;
}

/**
 * Same RBAC gate as `requireAdmin`, but throws instead of redirecting.
 * Prefer for route handlers / programmatic callers.
 */
export async function requireAdminOrThrow(
  module?: AdminModule,
): Promise<AdminSession> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  if (module && !canAccess(session.user.role, module)) {
    throw new ForbiddenError(
      `Role ${session.user.role ?? "unknown"} cannot access module "${module}"`,
    );
  }
  return session as AdminSession;
}
