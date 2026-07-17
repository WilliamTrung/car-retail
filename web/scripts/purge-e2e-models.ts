import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const { count } = await prisma.vehicleModel.deleteMany({
    where: { name: { path: ["vi"], string_contains: "E2E Model" } },
  });
  console.log(`Purged ${count} E2E smoke model(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
