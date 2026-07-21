"use server";

import { guardAdmin } from "@/app/[locale]/(admin)/admin/(panel)/_lib/guard";
import {
  attributesService,
  type AttributeKeyCreateInput,
  type AttributeKeyDto,
  type AttributeKeyUpdateInput,
  type UnitCreateInput,
  type UnitDto,
  type UnitUpdateInput,
} from "@/server/modules/attributes";
import type { Result } from "@/server/result";

export async function createUnitAction(
  input: unknown,
): Promise<Result<UnitDto>> {
  const gate = await guardAdmin("units");
  if (!gate.ok) return gate;
  return attributesService.createUnit(input);
}

export async function updateUnitAction(
  id: string,
  input: unknown,
): Promise<Result<UnitDto>> {
  const gate = await guardAdmin("units");
  if (!gate.ok) return gate;
  return attributesService.updateUnit(id, input);
}

export async function deleteUnitAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("units");
  if (!gate.ok) return gate;
  return attributesService.deleteUnit(id);
}

export async function createAttributeKeyAction(
  input: unknown,
): Promise<Result<AttributeKeyDto>> {
  const gate = await guardAdmin("units");
  if (!gate.ok) return gate;
  return attributesService.createAttributeKey(input);
}

export async function updateAttributeKeyAction(
  id: string,
  input: unknown,
): Promise<Result<AttributeKeyDto>> {
  const gate = await guardAdmin("units");
  if (!gate.ok) return gate;
  return attributesService.updateAttributeKey(id, input);
}

export async function deleteAttributeKeyAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("units");
  if (!gate.ok) return gate;
  return attributesService.deleteAttributeKey(id);
}

export type CreateUnitAction = typeof createUnitAction;
export type UpdateUnitAction = typeof updateUnitAction;
export type DeleteUnitAction = typeof deleteUnitAction;
export type CreateAttributeKeyAction = typeof createAttributeKeyAction;
export type UpdateAttributeKeyAction = typeof updateAttributeKeyAction;
export type DeleteAttributeKeyAction = typeof deleteAttributeKeyAction;

export type {
  AttributeKeyCreateInput,
  AttributeKeyDto,
  AttributeKeyUpdateInput,
  UnitCreateInput,
  UnitDto,
  UnitUpdateInput,
};
