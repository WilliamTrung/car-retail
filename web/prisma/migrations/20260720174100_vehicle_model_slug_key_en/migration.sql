-- Dedupe VehicleModel rows sharing the same EN slug, then enforce slugKeyEn uniqueness.
-- Same discipline as T-0075 (slugKey): backfill → dedupe → NOT NULL → unique index.

ALTER TABLE "VehicleModel" ADD COLUMN "slugKeyEn" TEXT;

UPDATE "VehicleModel"
SET "slugKeyEn" = COALESCE(NULLIF(slug->>'en', ''), slug->>'vi')
WHERE "slugKeyEn" IS NULL;

-- Prefer canonical seed ids; otherwise newest updatedAt, then stable id.
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
      PARTITION BY vm."slugKeyEn"
      ORDER BY
        CASE WHEN vm.id IN (SELECT id FROM canonical_ids) THEN 0 ELSE 1 END,
        vm."updatedAt" DESC,
        vm.id ASC
    ) AS rn
  FROM "VehicleModel" vm
  WHERE vm."slugKeyEn" IS NOT NULL AND vm."slugKeyEn" <> ''
),
dupes AS (
  SELECT id FROM ranked WHERE rn > 1
)
-- FK children: Lead.modelId ON DELETE SET NULL; variants/features/faqs CASCADE.
DELETE FROM "VehicleModel"
WHERE id IN (SELECT id FROM dupes);

ALTER TABLE "VehicleModel" ALTER COLUMN "slugKeyEn" SET NOT NULL;

CREATE UNIQUE INDEX "VehicleModel_slugKeyEn_key" ON "VehicleModel"("slugKeyEn");
