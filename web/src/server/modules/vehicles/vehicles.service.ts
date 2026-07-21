import type { Prisma } from "@prisma/client";
import { AttributeTemplateItemsSchema } from "@/server/db/zod";
import { cachedRead, revalidateTags, TAGS } from "@/server/cache/tags";
import { jsonField } from "@/server/modules/json-field";
import { err, ok, type Result } from "@/server/result";
import {
  applyTemplateAttributes,
  parseAttributes,
  toFeatureSectionDto,
  toLineDto,
  toModelDto,
  toModelFaqDto,
  toSegmentDto,
  toVariantDto,
} from "./vehicles.mapper";
import { toMediaAssetDto } from "@/server/modules/media/media.mapper";
import * as repo from "./vehicles.repository";
import {
  ApplyTemplateInputSchema,
  FeatureSectionCreateSchema,
  FeatureSectionUpdateSchema,
  LineCreateSchema,
  LineUpdateSchema,
  ModelCreateSchema,
  ModelFaqCreateSchema,
  ModelFaqUpdateSchema,
  ModelUpdateSchema,
  PublishFlagSchema,
  SegmentCreateSchema,
  SegmentUpdateSchema,
  VariantCreateSchema,
  VariantUpdateSchema,
  type ApplyTemplateInput,
  type ModelDto,
  type VariantDto,
} from "./vehicles.schema";

function bustModels() {
  revalidateTags(TAGS.models);
}

// --- Public cached reads ---

export function getPublishedModels() {
  return cachedRead(
    ["public-models"],
    async () => {
      const rows = await repo.listPublishedModels();
      return rows.map((row) => ({
        ...toModelDto(row),
        heroMedia: row.heroMedia ? toMediaAssetDto(row.heroMedia) : null,
        segment: row.segment
          ? {
              ...toSegmentDto(row.segment),
              line: toLineDto(row.segment.line),
            }
          : null,
      }));
    },
    [TAGS.models],
  );
}

export function getModelBySlug(locale: string, slug: string) {
  return cachedRead(
    ["public-model-slug", locale, slug],
    async () => {
      const row = await repo.findPublishedModelBySlug(slug, locale);
      if (!row) return null;
      return {
        ...toModelDto(row),
        heroMedia: row.heroMedia ? toMediaAssetDto(row.heroMedia) : null,
        segment: row.segment
          ? {
              ...toSegmentDto(row.segment),
              line: toLineDto(row.segment.line),
            }
          : null,
      };
    },
    [TAGS.models],
  );
}

export function getModelWithDetails(id: string) {
  return cachedRead(
    ["public-model", id],
    async () => {
      const row = await repo.findPublishedModelWithDetails(id);
      if (!row) return null;
      const dto = toModelDto(row);
      return {
        ...dto,
        heroMedia: row.heroMedia ? toMediaAssetDto(row.heroMedia) : null,
        featureSections: row.featureSections.map(toFeatureSectionDto),
        faqs: row.faqs.map(toModelFaqDto),
        galleryMedia: row.galleryMedia.map((asset) => toMediaAssetDto(asset)),
        colorSwatches: dto.colorSwatches.map((s) => {
          const asset = s.swatchMediaId
            ? row.mediaById.get(s.swatchMediaId)
            : undefined;
          return {
            ...s,
            imageMedia: asset ? toMediaAssetDto(asset) : null,
          };
        }),
        segment: row.segment
          ? {
              ...toSegmentDto(row.segment),
              line: toLineDto(row.segment.line),
            }
          : null,
      };
    },
    [TAGS.models],
  );
}

/**
 * Public API shape for `GET /api/models/[slug]`: `{ units, attributes }`.
 * Units keyed by `{ key, value:{vi,en} }` only — no `label`/`display` on attributes.
 * Dynamic import avoids a cycle with attributes.service → applyTemplate.
 */
export async function getModelAttributesBySlug(locale: string, slug: string) {
  const model = await getModelBySlug(locale, slug);
  if (!model) return null;

  const { attributesService } = await import("@/server/modules/attributes");
  const unitRows = await attributesService.getUnitsPublic();

  return {
    units: unitRows.map(({ key, value }) => ({ key, value })),
    attributes: model.attributes.map(({ key, value, unit }) => ({
      key,
      value,
      unit,
    })),
  };
}

// --- Lines / segments ---

export async function listLinesAdmin() {
  const rows = await repo.listLines();
  return rows.map((line) => ({
    ...toLineDto(line),
    segments: line.segments.map(toSegmentDto),
  }));
}

export async function createLine(input: unknown): Promise<Result<ReturnType<typeof toLineDto>>> {
  const parsed = LineCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid line input",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.createLine({
    key: parsed.data.key,
    name: parsed.data.name,
    sortOrder: parsed.data.sortOrder ?? 0,
  });
  bustModels();
  return ok(toLineDto(row));
}

export async function updateLine(
  id: string,
  input: unknown,
): Promise<Result<ReturnType<typeof toLineDto>>> {
  const parsed = LineUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid line update",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.updateLine(id, parsed.data);
  bustModels();
  return ok(toLineDto(row));
}

export async function deleteLine(id: string): Promise<Result<{ ok: true }>> {
  await repo.deleteLine(id);
  bustModels();
  return ok({ ok: true });
}

export async function createSegment(
  input: unknown,
): Promise<Result<ReturnType<typeof toSegmentDto>>> {
  const parsed = SegmentCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid segment input",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.createSegment({
    key: parsed.data.key,
    name: parsed.data.name,
    sortOrder: parsed.data.sortOrder ?? 0,
    line: { connect: { id: parsed.data.lineId } },
  });
  bustModels();
  return ok(toSegmentDto(row));
}

export async function updateSegment(
  id: string,
  input: unknown,
): Promise<Result<ReturnType<typeof toSegmentDto>>> {
  const parsed = SegmentUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid segment update",
      details: parsed.error.flatten(),
    });
  }
  const { lineId, ...rest } = parsed.data;
  const row = await repo.updateSegment(id, {
    ...rest,
    ...(lineId ? { line: { connect: { id: lineId } } } : {}),
  });
  bustModels();
  return ok(toSegmentDto(row));
}

export async function deleteSegment(id: string): Promise<Result<{ ok: true }>> {
  await repo.deleteSegment(id);
  bustModels();
  return ok({ ok: true });
}

// --- Models ---

export async function listModelsAdmin() {
  const rows = await repo.listAdminModels();
  return rows.map((row) => ({
    ...toModelDto(row),
    segment: row.segment
      ? {
          ...toSegmentDto(row.segment),
          line: toLineDto(row.segment.line),
        }
      : null,
  }));
}

export async function getModelAdmin(id: string) {
  const row = await repo.findModelById(id);
  if (!row) return null;
  return {
    ...toModelDto(row),
    featureSections: row.featureSections.map(toFeatureSectionDto),
    faqs: row.faqs.map(toModelFaqDto),
    segment: row.segment
      ? {
          ...toSegmentDto(row.segment),
          line: toLineDto(row.segment.line),
        }
      : null,
  };
}

export async function createModel(input: unknown): Promise<Result<ModelDto>> {
  const parsed = ModelCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid model input",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.createModel({
    name: d.name,
    slug: d.slug,
    slugKey: d.slug.vi,
    // Match migration backfill: empty en falls back to vi (unique slugKeyEn).
    slugKeyEn: d.slug.en || d.slug.vi,
    tagline: d.tagline ?? undefined,
    description: d.description ?? undefined,
    meta: d.meta ?? undefined,
    gallery: d.gallery ?? [],
    colorSwatches: d.colorSwatches ?? [],
    promo: d.promo ?? undefined,
    attributes: d.attributes ?? [],
    published: d.published ?? false,
    sortOrder: d.sortOrder ?? 0,
    segment: { connect: { id: d.segmentId } },
    ...(d.heroMediaId
      ? { heroMedia: { connect: { id: d.heroMediaId } } }
      : {}),
  });
  bustModels();
  return ok(toModelDto(row));
}

export async function updateModel(
  id: string,
  input: unknown,
): Promise<Result<ModelDto>> {
  const parsed = ModelUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid model update",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.updateModel(id, {
    ...(d.name !== undefined ? { name: d.name } : {}),
    ...(d.slug !== undefined
      ? {
          slug: d.slug,
          slugKey: d.slug.vi,
          slugKeyEn: d.slug.en || d.slug.vi,
        }
      : {}),
    ...(d.tagline !== undefined ? { tagline: jsonField(d.tagline) } : {}),
    ...(d.description !== undefined
      ? { description: jsonField(d.description) }
      : {}),
    ...(d.meta !== undefined ? { meta: jsonField(d.meta) } : {}),
    ...(d.gallery !== undefined
      ? { gallery: d.gallery as Prisma.InputJsonValue }
      : {}),
    ...(d.colorSwatches !== undefined
      ? { colorSwatches: d.colorSwatches as Prisma.InputJsonValue }
      : {}),
    ...(d.promo !== undefined ? { promo: jsonField(d.promo) } : {}),
    ...(d.attributes !== undefined
      ? { attributes: d.attributes as Prisma.InputJsonValue }
      : {}),
    ...(d.published !== undefined ? { published: d.published } : {}),
    ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
    ...(d.segmentId
      ? { segment: { connect: { id: d.segmentId } } }
      : {}),
    ...(d.heroMediaId !== undefined
      ? d.heroMediaId
        ? { heroMedia: { connect: { id: d.heroMediaId } } }
        : { heroMedia: { disconnect: true } }
      : {}),
  });
  bustModels();
  return ok(toModelDto(row));
}

export async function deleteModel(id: string): Promise<Result<{ ok: true }>> {
  await repo.deleteModel(id);
  bustModels();
  return ok({ ok: true });
}

export async function setModelPublished(
  id: string,
  input: unknown,
): Promise<Result<ModelDto>> {
  const parsed = PublishFlagSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid publish flag",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.updateModel(id, { published: parsed.data.published });
  bustModels();
  return ok(toModelDto(row));
}

export async function applyTemplate(
  input: ApplyTemplateInput | unknown,
): Promise<Result<ModelDto>> {
  const parsed = ApplyTemplateInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid apply-template input",
      details: parsed.error.flatten(),
    });
  }

  const template = await repo.findTemplateByIdOrKey({
    templateId: parsed.data.templateId,
    templateKey: parsed.data.templateKey,
  });
  if (!template) {
    return err({ code: "NOT_FOUND", message: "Template not found" });
  }

  const model = await repo.findModelById(parsed.data.modelId);
  if (!model) {
    return err({ code: "NOT_FOUND", message: "Model not found" });
  }

  const templateItems = AttributeTemplateItemsSchema.parse(template.items);
  const nextAttributes = applyTemplateAttributes(
    parseAttributes(model.attributes),
    templateItems,
    parsed.data.mode,
  );

  const row = await repo.updateModel(parsed.data.modelId, {
    attributes: nextAttributes as Prisma.InputJsonValue,
  });
  bustModels();
  return ok(toModelDto(row));
}

// --- Variants ---

export async function createVariant(
  input: unknown,
): Promise<Result<VariantDto>> {
  const parsed = VariantCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid variant input",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.createVariant({
    name: d.name,
    price: d.price ?? null,
    attributes: d.attributes ?? [],
    allowDeposit: d.allowDeposit ?? true,
    allowTestDrive: d.allowTestDrive ?? true,
    published: d.published ?? false,
    sortOrder: d.sortOrder ?? 0,
    model: { connect: { id: d.modelId } },
  });
  bustModels();
  return ok(toVariantDto(row));
}

export async function updateVariant(
  id: string,
  input: unknown,
): Promise<Result<VariantDto>> {
  const parsed = VariantUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid variant update",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.updateVariant(id, parsed.data);
  bustModels();
  return ok(toVariantDto(row));
}

export async function deleteVariant(id: string): Promise<Result<{ ok: true }>> {
  await repo.deleteVariant(id);
  bustModels();
  return ok({ ok: true });
}

export async function setVariantPublished(
  id: string,
  input: unknown,
): Promise<Result<VariantDto>> {
  const parsed = PublishFlagSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid publish flag",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.updateVariant(id, {
    published: parsed.data.published,
  });
  bustModels();
  return ok(toVariantDto(row));
}

// --- Feature sections / model FAQs ---

export async function createFeatureSection(input: unknown) {
  const parsed = FeatureSectionCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid feature section",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.createFeatureSection({
    title: d.title,
    body: d.body,
    sortOrder: d.sortOrder ?? 0,
    model: { connect: { id: d.modelId } },
    ...(d.imageMediaId
      ? { imageMedia: { connect: { id: d.imageMediaId } } }
      : {}),
  });
  bustModels();
  return ok(toFeatureSectionDto(row));
}

export async function updateFeatureSection(id: string, input: unknown) {
  const parsed = FeatureSectionUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid feature section update",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.updateFeatureSection(id, {
    ...(d.title !== undefined ? { title: d.title } : {}),
    ...(d.body !== undefined ? { body: d.body } : {}),
    ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
    ...(d.imageMediaId !== undefined
      ? d.imageMediaId
        ? { imageMedia: { connect: { id: d.imageMediaId } } }
        : { imageMedia: { disconnect: true } }
      : {}),
  });
  bustModels();
  return ok(toFeatureSectionDto(row));
}

export async function deleteFeatureSection(
  id: string,
): Promise<Result<{ ok: true }>> {
  await repo.deleteFeatureSection(id);
  bustModels();
  return ok({ ok: true });
}

export async function createModelFaq(input: unknown) {
  const parsed = ModelFaqCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid model FAQ",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.createModelFaq({
    question: d.question,
    answer: d.answer,
    sortOrder: d.sortOrder ?? 0,
    model: { connect: { id: d.modelId } },
  });
  bustModels();
  return ok(toModelFaqDto(row));
}

export async function updateModelFaq(id: string, input: unknown) {
  const parsed = ModelFaqUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid model FAQ update",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.updateModelFaq(id, parsed.data);
  bustModels();
  return ok(toModelFaqDto(row));
}

export async function deleteModelFaq(id: string): Promise<Result<{ ok: true }>> {
  await repo.deleteModelFaq(id);
  bustModels();
  return ok({ ok: true });
}
