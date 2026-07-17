"use server";

import { guardAdmin } from "@/app/admin/(panel)/_lib/guard";
import {
  contentService,
  type NewsCreateInput,
  type NewsDto,
  type NewsUpdateInput,
} from "@/server/modules/content";
import type { Result } from "@/server/result";

export async function createNewsAction(
  input: unknown,
): Promise<Result<NewsDto>> {
  const gate = await guardAdmin("news");
  if (!gate.ok) return gate;
  return contentService.createNews(input);
}

export async function updateNewsAction(
  id: string,
  input: unknown,
): Promise<Result<NewsDto>> {
  const gate = await guardAdmin("news");
  if (!gate.ok) return gate;
  return contentService.updateNews(id, input);
}

export async function deleteNewsAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("news");
  if (!gate.ok) return gate;
  return contentService.deleteNews(id);
}

export type CreateNewsAction = typeof createNewsAction;
export type UpdateNewsAction = typeof updateNewsAction;
export type DeleteNewsAction = typeof deleteNewsAction;

export type { NewsCreateInput, NewsDto, NewsUpdateInput };
