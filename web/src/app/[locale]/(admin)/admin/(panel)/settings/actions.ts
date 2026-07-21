"use server";

import { guardAdmin } from "@/app/[locale]/(admin)/admin/(panel)/_lib/guard";
import {
  settingsService,
  type SiteSettingsDto,
  type SiteSettingsUpdateInput,
} from "@/server/modules/settings";
import type { Result } from "@/server/result";

export async function updateSiteSettingsAction(
  input: unknown,
): Promise<Result<SiteSettingsDto>> {
  const gate = await guardAdmin("settings");
  if (!gate.ok) return gate;
  return settingsService.updateSiteSettings(input);
}

export type UpdateSiteSettingsAction = typeof updateSiteSettingsAction;

export type { SiteSettingsDto, SiteSettingsUpdateInput };
