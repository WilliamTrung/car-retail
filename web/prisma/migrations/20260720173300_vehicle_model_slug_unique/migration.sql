-- Dedupe VehicleModel rows sharing the same slug, then enforce slugKey uniqueness.

ALTER TABLE "VehicleModel" ADD COLUMN "slugKey" TEXT;

UPDATE "VehicleModel" SET "slugKey" = slug->>'vi' WHERE "slugKey" IS NULL;

WITH canonical_ids AS (
  SELECT unnest(
    ARRAY[
      'seed-model-city-ev',
      'seed-model-family-suv',
      'seed-model-urban-mpv',
      'seed-model-cargo-van',
      'seed-model-metro',
      'seed-model-limo'
    ]::text[]
  ) AS id
),
ranked AS (
  SELECT
    vm.id,
    ROW_NUMBER() OVER (
      PARTITION BY vm."slugKey"
      ORDER BY
        CASE WHEN vm.id IN (SELECT id FROM canonical_ids) THEN 0 ELSE 1 END,
        vm."updatedAt" DESC,
        vm.id ASC
    ) AS rn
  FROM "VehicleModel" vm
  WHERE vm."slugKey" IS NOT NULL AND vm."slugKey" <> ''
)
DELETE FROM "VehicleModel"
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

ALTER TABLE "VehicleModel" ALTER COLUMN "slugKey" SET NOT NULL;

CREATE UNIQUE INDEX "VehicleModel_slugKey_key" ON "VehicleModel"("slugKey");
