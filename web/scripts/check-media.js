import prisma from "../lib/prisma.js";

const mediaCount = await prisma.mediaAsset.count();
const modelsWithHero = await prisma.vehicleModel.count({
  where: { heroMediaId: { not: null } },
});
const slidesWithImage = await prisma.heroSlide.count({
  where: { imageMediaId: { not: null } },
});
const assets = await prisma.mediaAsset.findMany({
  take: 10,
  select: { id: true, r2Key: true, publicUrl: true, folder: true },
  orderBy: { createdAt: "desc" },
});

console.log(
  JSON.stringify(
    { mediaCount, modelsWithHero, slidesWithImage, assets },
    null,
    2
  )
);

await prisma.$disconnect();
