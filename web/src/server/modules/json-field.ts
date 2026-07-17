import { Prisma } from "@prisma/client";

/** Prisma rejects bare `null` for Json columns — use JsonNull. */
export function jsonField(
  value: unknown,
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}
