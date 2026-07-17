import type {
  FeatureSection,
  MediaAsset,
  ModelFaq,
  VehicleLine,
  VehicleModel,
  VehicleSegment,
  VehicleVariant,
} from "@prisma/client";
import { Prisma } from "@prisma/client";
import {
  AttributeListSchema,
  LocalizedTextSchema,
  MediaIdListSchema,
  SeoMetaSchema,
  type AttributeItem,
  type AttributeTemplateItem,
  type LocalizedText,
} from "@/server/db/zod";
import type { ApplyTemplateMode, ModelDto, VariantDto } from "./vehicles.schema";
import {
  ColorSwatchListSchema,
  ModelPromoSchema,
} from "./vehicles.schema";
export function decimalToNumber(
  value: Prisma.Decimal | number | string | null | undefined,
): number | null {
  if (value == null) return null;
  return Number(value);
}

export function parseLocalized(value: unknown): LocalizedText {
  return LocalizedTextSchema.parse(value);
}

export function parseLocalizedNullable(value: unknown): LocalizedText | null {
  if (value == null) return null;
  return LocalizedTextSchema.parse(value);
}

export function parseAttributes(value: unknown): AttributeItem[] {
  return AttributeListSchema.parse(value ?? []);
}

export function parseColorSwatches(value: unknown) {
  return ColorSwatchListSchema.parse(value ?? []);
}

export function parseModelPromo(value: unknown) {
  if (value == null) return null;
  return ModelPromoSchema.parse(value);
}

/**
 * Merge or replace model attributes from a template.
 * - `replace`: template items become the full attribute list (legacy behaviour).
 * - `merge`: template keys upsert; keys only on the model are kept.
 */
export function applyTemplateAttributes(
  existing: AttributeItem[],
  templateItems: AttributeTemplateItem[],
  mode: ApplyTemplateMode,
): AttributeItem[] {
  const fromTemplate: AttributeItem[] = [...templateItems]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((item) => ({
      key: item.key,
      value: item.defaultValue ?? "",
      unit: item.unit,
    }));

  if (mode === "replace") {
    return fromTemplate;
  }

  const byKey = new Map(existing.map((a) => [a.key, a]));
  for (const item of fromTemplate) {
    byKey.set(item.key, item);
  }

  const ordered: AttributeItem[] = [];
  const seen = new Set<string>();

  for (const item of existing) {
    const next = byKey.get(item.key);
    if (next) {
      ordered.push(next);
      seen.add(item.key);
    }
  }
  for (const item of fromTemplate) {
    if (!seen.has(item.key)) {
      ordered.push(item);
      seen.add(item.key);
    }
  }
  return ordered;
}

export function toVariantDto(row: VehicleVariant): VariantDto {
  return {
    id: row.id,
    modelId: row.modelId,
    name: parseLocalized(row.name),
    price: decimalToNumber(row.price),
    attributes: parseAttributes(row.attributes),
    allowDeposit: row.allowDeposit,
    allowTestDrive: row.allowTestDrive,
    published: row.published,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toModelDto(
  row: VehicleModel & { variants?: VehicleVariant[] },
): ModelDto {
  return {
    id: row.id,
    segmentId: row.segmentId,
    name: parseLocalized(row.name),
    slug: parseLocalized(row.slug),
    tagline: parseLocalizedNullable(row.tagline),
    description: parseLocalizedNullable(row.description),
    meta: row.meta == null ? null : SeoMetaSchema.parse(row.meta),
    heroMediaId: row.heroMediaId,
    gallery: MediaIdListSchema.parse(row.gallery ?? []),
    colorSwatches: parseColorSwatches(row.colorSwatches),
    promo: parseModelPromo(row.promo),
    attributes: parseAttributes(row.attributes),
    published: row.published,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    variants: row.variants?.map(toVariantDto),
  };
}

export function toLineDto(row: VehicleLine) {
  return {
    id: row.id,
    key: row.key,
    name: parseLocalized(row.name),
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toSegmentDto(row: VehicleSegment) {
  return {
    id: row.id,
    lineId: row.lineId,
    key: row.key,
    name: parseLocalized(row.name),
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toFeatureSectionDto(
  row: FeatureSection & { imageMedia?: MediaAsset | null },
) {
  return {
    id: row.id,
    modelId: row.modelId,
    title: parseLocalized(row.title),
    body: parseLocalized(row.body),
    imageMediaId: row.imageMediaId,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    imageMedia: row.imageMedia ?? null,
  };
}

export function toModelFaqDto(row: ModelFaq) {
  return {
    id: row.id,
    modelId: row.modelId,
    question: parseLocalized(row.question),
    answer: parseLocalized(row.answer),
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function pickLocale(
  field: LocalizedText | null | undefined,
  locale: string,
): string {
  if (!field) return "";
  const value = locale === "en" ? field.en : field.vi;
  return value || field.vi || field.en || "";
}
