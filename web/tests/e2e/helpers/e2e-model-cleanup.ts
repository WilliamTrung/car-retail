import { PrismaClient } from "@prisma/client";

/** Slugs created by smoke.spec.ts — refuse anything else. */
const E2E_SLUG_RE = /^e2e-model-\d+$/;

const prisma = new PrismaClient();

export async function deleteE2eModelBySlug(slug: string): Promise<void> {
  if (!E2E_SLUG_RE.test(slug)) {
    throw new Error(`Refusing to delete non-E2E slug: ${slug}`);
  }

  const row = await prisma.vehicleModel.findFirst({
    where: { slug: { path: ["vi"], equals: slug } },
    select: { id: true },
  });
  if (!row) return;

  await prisma.vehicleModel.delete({ where: { id: row.id } });
}

export async function disconnectE2eDb(): Promise<void> {
  await prisma.$disconnect();
}
