import type { AdminModule } from "@/server/auth/rbac";
import { requireAdminOrThrow } from "@/server/auth/session";
import { err, type Result } from "@/server/result";

/** RBAC gate for admin Server Actions — never redirects; returns typed Result. */
export async function guardAdmin(
  module: AdminModule,
): Promise<Result<true>> {
  try {
    await requireAdminOrThrow(module);
    return { ok: true, data: true };
  } catch {
    return err({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }
}
