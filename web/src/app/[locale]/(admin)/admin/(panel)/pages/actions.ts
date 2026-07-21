"use server";

import { guardAdmin } from "@/app/[locale]/(admin)/admin/(panel)/_lib/guard";
import {
  contentService,
  type FaqCreateInput,
  type FaqDto,
  type FaqUpdateInput,
  type PageCreateInput,
  type PageDto,
  type PageUpdateInput,
  type PolicyCreateInput,
  type PolicyDto,
  type PolicyUpdateInput,
} from "@/server/modules/content";
import type { Result } from "@/server/result";

// --- Pages ---

export async function createPageAction(
  input: unknown,
): Promise<Result<PageDto>> {
  const gate = await guardAdmin("pages");
  if (!gate.ok) return gate;
  return contentService.createPage(input);
}

export async function updatePageAction(
  id: string,
  input: unknown,
): Promise<Result<PageDto>> {
  const gate = await guardAdmin("pages");
  if (!gate.ok) return gate;
  return contentService.updatePage(id, input);
}

export async function deletePageAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("pages");
  if (!gate.ok) return gate;
  return contentService.deletePage(id);
}

// --- Policies ---

export async function createPolicyAction(
  input: unknown,
): Promise<Result<PolicyDto>> {
  const gate = await guardAdmin("pages");
  if (!gate.ok) return gate;
  return contentService.createPolicy(input);
}

export async function updatePolicyAction(
  id: string,
  input: unknown,
): Promise<Result<PolicyDto>> {
  const gate = await guardAdmin("pages");
  if (!gate.ok) return gate;
  return contentService.updatePolicy(id, input);
}

export async function deletePolicyAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("pages");
  if (!gate.ok) return gate;
  return contentService.deletePolicy(id);
}

// --- Global FAQs ---

export async function createFaqAction(
  input: unknown,
): Promise<Result<FaqDto>> {
  const gate = await guardAdmin("pages");
  if (!gate.ok) return gate;
  return contentService.createFaq(input);
}

export async function updateFaqAction(
  id: string,
  input: unknown,
): Promise<Result<FaqDto>> {
  const gate = await guardAdmin("pages");
  if (!gate.ok) return gate;
  return contentService.updateFaq(id, input);
}

export async function deleteFaqAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("pages");
  if (!gate.ok) return gate;
  return contentService.deleteFaq(id);
}

export type CreatePageAction = typeof createPageAction;
export type UpdatePageAction = typeof updatePageAction;
export type DeletePageAction = typeof deletePageAction;
export type CreatePolicyAction = typeof createPolicyAction;
export type UpdatePolicyAction = typeof updatePolicyAction;
export type DeletePolicyAction = typeof deletePolicyAction;
export type CreateFaqAction = typeof createFaqAction;
export type UpdateFaqAction = typeof updateFaqAction;
export type DeleteFaqAction = typeof deleteFaqAction;

export type {
  FaqCreateInput,
  FaqDto,
  FaqUpdateInput,
  PageCreateInput,
  PageDto,
  PageUpdateInput,
  PolicyCreateInput,
  PolicyDto,
  PolicyUpdateInput,
};
