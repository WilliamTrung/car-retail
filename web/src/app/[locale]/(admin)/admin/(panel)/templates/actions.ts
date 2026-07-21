"use server";

import { guardAdmin } from "@/app/[locale]/(admin)/admin/(panel)/_lib/guard";
import {
  attributesService,
  type ApplyTemplateToModelInput,
  type SaveAsTemplateInput,
  type TemplateCreateInput,
  type TemplateDto,
  type TemplateUpdateInput,
} from "@/server/modules/attributes";
import type { ModelDto } from "@/server/modules/vehicles";
import type { Result } from "@/server/result";

export async function createTemplateAction(
  input: unknown,
): Promise<Result<TemplateDto>> {
  const gate = await guardAdmin("templates");
  if (!gate.ok) return gate;
  return attributesService.createTemplate(input);
}

export async function updateTemplateAction(
  id: string,
  input: unknown,
): Promise<Result<TemplateDto>> {
  const gate = await guardAdmin("templates");
  if (!gate.ok) return gate;
  return attributesService.updateTemplate(id, input);
}

export async function deleteTemplateAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("templates");
  if (!gate.ok) return gate;
  return attributesService.deleteTemplate(id);
}

export async function saveAsTemplateAction(
  input: unknown,
): Promise<Result<TemplateDto>> {
  const gate = await guardAdmin("templates");
  if (!gate.ok) return gate;
  return attributesService.saveAsTemplate(input);
}

export async function applyTemplateAction(
  input: unknown,
): Promise<Result<ModelDto>> {
  const gate = await guardAdmin("templates");
  if (!gate.ok) return gate;
  return attributesService.applyTemplate(input);
}

export type CreateTemplateAction = typeof createTemplateAction;
export type UpdateTemplateAction = typeof updateTemplateAction;
export type DeleteTemplateAction = typeof deleteTemplateAction;
export type SaveAsTemplateAction = typeof saveAsTemplateAction;
export type ApplyTemplateAction = typeof applyTemplateAction;

export type {
  ApplyTemplateToModelInput,
  ModelDto,
  SaveAsTemplateInput,
  TemplateCreateInput,
  TemplateDto,
  TemplateUpdateInput,
};
