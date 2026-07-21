"use server";

import { guardAdmin } from "@/app/[locale]/(admin)/admin/(panel)/_lib/guard";
import {
  settingsService,
  type HotlineCreateInput,
  type HotlineDto,
  type HotlineUpdateInput,
  type MenuItemCreateInput,
  type MenuItemDto,
  type MenuItemUpdateInput,
} from "@/server/modules/settings";
import type { Result } from "@/server/result";

// --- Menu items ---

export async function createMenuItemAction(
  input: unknown,
): Promise<Result<MenuItemDto>> {
  const gate = await guardAdmin("navigation");
  if (!gate.ok) return gate;
  return settingsService.createMenuItem(input);
}

export async function updateMenuItemAction(
  id: string,
  input: unknown,
): Promise<Result<MenuItemDto>> {
  const gate = await guardAdmin("navigation");
  if (!gate.ok) return gate;
  return settingsService.updateMenuItem(id, input);
}

export async function deleteMenuItemAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("navigation");
  if (!gate.ok) return gate;
  return settingsService.deleteMenuItem(id);
}

// --- Hotlines ---

export async function createHotlineAction(
  input: unknown,
): Promise<Result<HotlineDto>> {
  const gate = await guardAdmin("navigation");
  if (!gate.ok) return gate;
  return settingsService.createHotline(input);
}

export async function updateHotlineAction(
  id: string,
  input: unknown,
): Promise<Result<HotlineDto>> {
  const gate = await guardAdmin("navigation");
  if (!gate.ok) return gate;
  return settingsService.updateHotline(id, input);
}

export async function deleteHotlineAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("navigation");
  if (!gate.ok) return gate;
  return settingsService.deleteHotline(id);
}

export type CreateMenuItemAction = typeof createMenuItemAction;
export type UpdateMenuItemAction = typeof updateMenuItemAction;
export type DeleteMenuItemAction = typeof deleteMenuItemAction;
export type CreateHotlineAction = typeof createHotlineAction;
export type UpdateHotlineAction = typeof updateHotlineAction;
export type DeleteHotlineAction = typeof deleteHotlineAction;

export type {
  HotlineCreateInput,
  HotlineDto,
  HotlineUpdateInput,
  MenuItemCreateInput,
  MenuItemDto,
  MenuItemUpdateInput,
};
