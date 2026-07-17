import type { AttributeKey, AttributeTemplate, Unit } from "@prisma/client";
import {
  AttributeTemplateItemsSchema,
  LocalizedTextSchema,
} from "@/server/db/zod";
import type {
  AttributeKeyDto,
  TemplateDto,
  UnitDto,
} from "./attributes.schema";

export function toUnitDto(row: Unit): UnitDto {
  return {
    id: row.id,
    key: row.key,
    value: LocalizedTextSchema.parse(row.value),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toAttributeKeyDto(row: AttributeKey): AttributeKeyDto {
  return {
    id: row.id,
    key: row.key,
    groupKey: row.groupKey,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toTemplateDto(row: AttributeTemplate): TemplateDto {
  return {
    id: row.id,
    key: row.key,
    name: LocalizedTextSchema.parse(row.name),
    items: AttributeTemplateItemsSchema.parse(row.items),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
