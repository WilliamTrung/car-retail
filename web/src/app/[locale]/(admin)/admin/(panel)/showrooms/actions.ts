"use server";

import { guardAdmin } from "@/app/[locale]/(admin)/admin/(panel)/_lib/guard";
import {
  showroomsService,
  type ShowroomCreateInput,
  type ShowroomDto,
  type ShowroomUpdateInput,
} from "@/server/modules/showrooms";
import type { Result } from "@/server/result";

export async function createShowroomAction(
  input: unknown,
): Promise<Result<ShowroomDto>> {
  const gate = await guardAdmin("showrooms");
  if (!gate.ok) return gate;
  return showroomsService.createShowroom(input);
}

export async function updateShowroomAction(
  id: string,
  input: unknown,
): Promise<Result<ShowroomDto>> {
  const gate = await guardAdmin("showrooms");
  if (!gate.ok) return gate;
  return showroomsService.updateShowroom(id, input);
}

export async function deleteShowroomAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("showrooms");
  if (!gate.ok) return gate;
  return showroomsService.deleteShowroom(id);
}

export type CreateShowroomAction = typeof createShowroomAction;
export type UpdateShowroomAction = typeof updateShowroomAction;
export type DeleteShowroomAction = typeof deleteShowroomAction;

export type { ShowroomCreateInput, ShowroomDto, ShowroomUpdateInput };
