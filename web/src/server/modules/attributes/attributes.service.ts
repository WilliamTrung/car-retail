import {
  AttributeListSchema,
  type AttributeTemplateItem,
} from "@/server/db/zod";
import { cachedRead, revalidateTags, TAGS } from "@/server/cache/tags";
import { err, ok, type Result } from "@/server/result";
import { applyTemplate as vehiclesApplyTemplate } from "@/server/modules/vehicles/vehicles.service";
import {
  toAttributeKeyDto,
  toTemplateDto,
  toUnitDto,
} from "./attributes.mapper";
import * as repo from "./attributes.repository";
import {
  ApplyTemplateToModelSchema,
  AttributeKeyCreateSchema,
  AttributeKeyUpdateSchema,
  SaveAsTemplateInputSchema,
  TemplateCreateSchema,
  TemplateUpdateSchema,
  UnitCreateSchema,
  UnitUpdateSchema,
  type AttributeKeyDto,
  type TemplateDto,
  type UnitDto,
} from "./attributes.schema";

function bustUnits() {
  revalidateTags(TAGS.units);
}

export function getUnitsPublic() {
  return cachedRead(
    ["public-units"],
    async () => {
      const rows = await repo.listUnits();
      return rows.map(toUnitDto);
    },
    [TAGS.units],
  );
}

export async function listUnitsAdmin() {
  const rows = await repo.listUnits();
  return rows.map(toUnitDto);
}

export async function createUnit(input: unknown): Promise<Result<UnitDto>> {
  const parsed = UnitCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid unit",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.createUnit(parsed.data);
  bustUnits();
  return ok(toUnitDto(row));
}

export async function updateUnit(
  id: string,
  input: unknown,
): Promise<Result<UnitDto>> {
  const parsed = UnitUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid unit update",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.updateUnit(id, parsed.data);
  bustUnits();
  return ok(toUnitDto(row));
}

export async function deleteUnit(id: string): Promise<Result<{ ok: true }>> {
  await repo.deleteUnit(id);
  bustUnits();
  return ok({ ok: true });
}

export async function listAttributeKeys() {
  const rows = await repo.listAttributeKeys();
  return rows.map(toAttributeKeyDto);
}

export async function createAttributeKey(
  input: unknown,
): Promise<Result<AttributeKeyDto>> {
  const parsed = AttributeKeyCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid attribute key",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.createAttributeKey({
    key: parsed.data.key,
    groupKey: parsed.data.groupKey ?? null,
    sortOrder: parsed.data.sortOrder ?? 0,
  });
  return ok(toAttributeKeyDto(row));
}

export async function updateAttributeKey(
  id: string,
  input: unknown,
): Promise<Result<AttributeKeyDto>> {
  const parsed = AttributeKeyUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid attribute key update",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.updateAttributeKey(id, parsed.data);
  return ok(toAttributeKeyDto(row));
}

export async function deleteAttributeKey(
  id: string,
): Promise<Result<{ ok: true }>> {
  await repo.deleteAttributeKey(id);
  return ok({ ok: true });
}

export async function listTemplates() {
  const rows = await repo.listTemplates();
  return rows.map(toTemplateDto);
}

export async function createTemplate(
  input: unknown,
): Promise<Result<TemplateDto>> {
  const parsed = TemplateCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid template",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.createTemplate(parsed.data);
  return ok(toTemplateDto(row));
}

export async function updateTemplate(
  id: string,
  input: unknown,
): Promise<Result<TemplateDto>> {
  const parsed = TemplateUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid template update",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.updateTemplate(id, parsed.data);
  return ok(toTemplateDto(row));
}

export async function deleteTemplate(
  id: string,
): Promise<Result<{ ok: true }>> {
  await repo.deleteTemplate(id);
  return ok({ ok: true });
}

/** Persist current model attributes as a new AttributeTemplate. */
export async function saveAsTemplate(
  input: unknown,
): Promise<Result<TemplateDto>> {
  const parsed = SaveAsTemplateInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid save-as-template input",
      details: parsed.error.flatten(),
    });
  }

  const model = await repo.findModelAttributes(parsed.data.modelId);
  if (!model) {
    return err({ code: "NOT_FOUND", message: "Model not found" });
  }

  const attributes = AttributeListSchema.parse(model.attributes ?? []);
  const items: AttributeTemplateItem[] = attributes.map((a, index) => ({
    key: a.key,
    unit: a.unit,
    defaultValue: a.value,
    sortOrder: index + 1,
  }));

  const row = await repo.createTemplate({
    key: parsed.data.key,
    name: parsed.data.name,
    items,
  });
  return ok(toTemplateDto(row));
}

/** Apply template onto a model (merge/replace) — vehicles owns write + revalidate. */
export async function applyTemplate(input: unknown) {
  const parsed = ApplyTemplateToModelSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid apply-template input",
      details: parsed.error.flatten(),
    });
  }
  return vehiclesApplyTemplate(parsed.data);
}
