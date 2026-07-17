"use server";

import { guardAdmin } from "@/app/admin/(panel)/_lib/guard";
import {
  vehiclesService,
  type ApplyTemplateInput,
  type FeatureSectionCreateInput,
  type FeatureSectionUpdateInput,
  type LineCreateInput,
  type LineUpdateInput,
  type ModelCreateInput,
  type ModelDto,
  type ModelFaqCreateInput,
  type ModelFaqUpdateInput,
  type ModelUpdateInput,
  type PublishFlagInput,
  type SegmentCreateInput,
  type SegmentUpdateInput,
  type VariantCreateInput,
  type VariantDto,
  type VariantUpdateInput,
} from "@/server/modules/vehicles";
import type { Result } from "@/server/result";
import { toFeatureSectionDto, toLineDto, toModelFaqDto, toSegmentDto } from "@/server/modules/vehicles/vehicles.mapper";

type LineDto = ReturnType<typeof toLineDto>;
type SegmentDto = ReturnType<typeof toSegmentDto>;
type FeatureSectionDto = ReturnType<typeof toFeatureSectionDto>;
type ModelFaqDto = ReturnType<typeof toModelFaqDto>;

// --- Lines ---

export async function createLineAction(
  input: unknown,
): Promise<Result<LineDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.createLine(input);
}

export async function updateLineAction(
  id: string,
  input: unknown,
): Promise<Result<LineDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.updateLine(id, input);
}

export async function deleteLineAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.deleteLine(id);
}

// --- Segments ---

export async function createSegmentAction(
  input: unknown,
): Promise<Result<SegmentDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.createSegment(input);
}

export async function updateSegmentAction(
  id: string,
  input: unknown,
): Promise<Result<SegmentDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.updateSegment(id, input);
}

export async function deleteSegmentAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.deleteSegment(id);
}

// --- Models ---

export async function createModelAction(
  input: unknown,
): Promise<Result<ModelDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.createModel(input);
}

export async function updateModelAction(
  id: string,
  input: unknown,
): Promise<Result<ModelDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.updateModel(id, input);
}

export async function deleteModelAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.deleteModel(id);
}

export async function setModelPublishedAction(
  id: string,
  input: unknown,
): Promise<Result<ModelDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.setModelPublished(id, input);
}

export async function applyTemplateAction(
  input: unknown,
): Promise<Result<ModelDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.applyTemplate(input);
}

// --- Variants ---

export async function createVariantAction(
  modelId: string,
  input: unknown,
): Promise<Result<VariantDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.createVariant({ ...(input as object), modelId });
}

export async function updateVariantAction(
  id: string,
  input: unknown,
): Promise<Result<VariantDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.updateVariant(id, input);
}

export async function deleteVariantAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.deleteVariant(id);
}

export async function setVariantPublishedAction(
  id: string,
  input: unknown,
): Promise<Result<VariantDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.setVariantPublished(id, input);
}

// --- Feature sections ---

export async function createFeatureSectionAction(
  input: unknown,
): Promise<Result<FeatureSectionDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.createFeatureSection(input);
}

export async function updateFeatureSectionAction(
  id: string,
  input: unknown,
): Promise<Result<FeatureSectionDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.updateFeatureSection(id, input);
}

export async function deleteFeatureSectionAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.deleteFeatureSection(id);
}

// --- Model FAQs ---

export async function createModelFaqAction(
  input: unknown,
): Promise<Result<ModelFaqDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.createModelFaq(input);
}

export async function updateModelFaqAction(
  id: string,
  input: unknown,
): Promise<Result<ModelFaqDto>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.updateModelFaq(id, input);
}

export async function deleteModelFaqAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("models");
  if (!gate.ok) return gate;
  return vehiclesService.deleteModelFaq(id);
}

// --- Exported types for UI ---

export type CreateLineAction = typeof createLineAction;
export type UpdateLineAction = typeof updateLineAction;
export type DeleteLineAction = typeof deleteLineAction;
export type CreateSegmentAction = typeof createSegmentAction;
export type UpdateSegmentAction = typeof updateSegmentAction;
export type DeleteSegmentAction = typeof deleteSegmentAction;
export type CreateModelAction = typeof createModelAction;
export type UpdateModelAction = typeof updateModelAction;
export type DeleteModelAction = typeof deleteModelAction;
export type SetModelPublishedAction = typeof setModelPublishedAction;
export type ApplyTemplateAction = typeof applyTemplateAction;
export type CreateVariantAction = typeof createVariantAction;
export type UpdateVariantAction = typeof updateVariantAction;
export type DeleteVariantAction = typeof deleteVariantAction;
export type SetVariantPublishedAction = typeof setVariantPublishedAction;
export type CreateFeatureSectionAction = typeof createFeatureSectionAction;
export type UpdateFeatureSectionAction = typeof updateFeatureSectionAction;
export type DeleteFeatureSectionAction = typeof deleteFeatureSectionAction;
export type CreateModelFaqAction = typeof createModelFaqAction;
export type UpdateModelFaqAction = typeof updateModelFaqAction;
export type DeleteModelFaqAction = typeof deleteModelFaqAction;

export type {
  ApplyTemplateInput,
  FeatureSectionCreateInput,
  FeatureSectionUpdateInput,
  FeatureSectionDto,
  LineCreateInput,
  LineDto,
  LineUpdateInput,
  ModelCreateInput,
  ModelDto,
  ModelFaqCreateInput,
  ModelFaqDto,
  ModelFaqUpdateInput,
  ModelUpdateInput,
  PublishFlagInput,
  SegmentCreateInput,
  SegmentDto,
  SegmentUpdateInput,
  VariantCreateInput,
  VariantDto,
  VariantUpdateInput,
};
