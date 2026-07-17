import type { MenuPlacement, Prisma } from "@prisma/client";
import { cachedRead, revalidateTags, TAGS } from "@/server/cache/tags";
import { jsonField } from "@/server/modules/json-field";
import { err, ok, type Result } from "@/server/result";
import {
  toHotlineDto,
  toMenuItemDto,
  toSiteSettingsDto,
} from "./settings.mapper";
import { toMediaAssetDto } from "@/server/modules/media/media.mapper";
import * as repo from "./settings.repository";
import {
  HotlineCreateSchema,
  HotlineUpdateSchema,
  MenuItemCreateSchema,
  MenuItemUpdateSchema,
  SiteSettingsUpdateSchema,
  type HotlineDto,
  type MenuItemDto,
  type SiteSettingsDto,
} from "./settings.schema";

export function getSiteSettingsPublic() {
  return cachedRead(
    ["public-site-settings"],
    async () => {
      const row = await repo.getSiteSettings();
      if (!row) return null;
      return {
        ...toSiteSettingsDto(row),
        logoMedia: row.logoMedia ? toMediaAssetDto(row.logoMedia) : null,
        faviconMedia: row.faviconMedia ? toMediaAssetDto(row.faviconMedia) : null,
      };
    },
    [TAGS.siteSettings],
  );
}

export function getMenuItemsPublic(placement: MenuPlacement) {
  return cachedRead(
    ["public-menu", placement],
    async () => {
      const rows = await repo.listMenuItems(placement);
      return rows.map(toMenuItemDto);
    },
    [TAGS.menu],
  );
}

export function getHotlinesPublic() {
  return cachedRead(
    ["public-hotlines"],
    async () => {
      const rows = await repo.listHotlines();
      return rows.map(toHotlineDto);
    },
    [TAGS.hotlines],
  );
}

export async function getSiteSettingsAdmin() {
  const row = await repo.getSiteSettings();
  return row ? toSiteSettingsDto(row) : null;
}

export async function updateSiteSettings(
  input: unknown,
): Promise<Result<SiteSettingsDto>> {
  const parsed = SiteSettingsUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid site settings",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const data: Prisma.SiteSettingsUpdateInput = {
    ...(d.dealerName !== undefined ? { dealerName: d.dealerName } : {}),
    ...(d.legalEntity !== undefined ? { legalEntity: d.legalEntity } : {}),
    ...(d.mst !== undefined ? { mst: d.mst } : {}),
    ...(d.email !== undefined ? { email: d.email || null } : {}),
    ...(d.copyright !== undefined ? { copyright: jsonField(d.copyright) } : {}),
    ...(d.socialLinks !== undefined
      ? { socialLinks: jsonField(d.socialLinks) }
      : {}),
    ...(d.privacyPolicyUrl !== undefined
      ? { privacyPolicyUrl: jsonField(d.privacyPolicyUrl) }
      : {}),
    ...(d.consentTemplate !== undefined
      ? { consentTemplate: jsonField(d.consentTemplate) }
      : {}),
    ...(d.seoDefaults !== undefined
      ? { seoDefaults: jsonField(d.seoDefaults) }
      : {}),
    ...(d.disclaimers !== undefined
      ? { disclaimers: jsonField(d.disclaimers) }
      : {}),
    ...(d.brandStory !== undefined
      ? { brandStory: jsonField(d.brandStory) }
      : {}),
    ...(d.tradeInBlock !== undefined
      ? { tradeInBlock: jsonField(d.tradeInBlock) }
      : {}),
    ...(d.promoCountdown !== undefined
      ? { promoCountdown: jsonField(d.promoCountdown) }
      : {}),
    ...(d.ctaTestDrive !== undefined
      ? { ctaTestDrive: jsonField(d.ctaTestDrive) }
      : {}),
    ...(d.ctaDeposit !== undefined
      ? { ctaDeposit: jsonField(d.ctaDeposit) }
      : {}),
    ...(d.maintenanceMode !== undefined
      ? { maintenanceMode: d.maintenanceMode }
      : {}),
    ...(d.logoMediaId !== undefined
      ? d.logoMediaId
        ? { logoMedia: { connect: { id: d.logoMediaId } } }
        : { logoMedia: { disconnect: true } }
      : {}),
    ...(d.faviconMediaId !== undefined
      ? d.faviconMediaId
        ? { faviconMedia: { connect: { id: d.faviconMediaId } } }
        : { faviconMedia: { disconnect: true } }
      : {}),
  };

  const row = await repo.updateSiteSettings(data);
  revalidateTags(TAGS.siteSettings);
  return ok(toSiteSettingsDto(row));
}

export async function listHotlinesAdmin() {
  return (await repo.listHotlines()).map(toHotlineDto);
}

export async function createHotline(
  input: unknown,
): Promise<Result<HotlineDto>> {
  const parsed = HotlineCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid hotline",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.createHotline({
    label: d.label,
    phone: d.phone,
    sortOrder: d.sortOrder ?? 0,
    ...(d.showroomId
      ? { showroom: { connect: { id: d.showroomId } } }
      : {}),
  });
  revalidateTags(TAGS.hotlines);
  return ok(toHotlineDto(row));
}

export async function updateHotline(
  id: string,
  input: unknown,
): Promise<Result<HotlineDto>> {
  const parsed = HotlineUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid hotline update",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.updateHotline(id, {
    ...(d.label !== undefined ? { label: d.label } : {}),
    ...(d.phone !== undefined ? { phone: d.phone } : {}),
    ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
    ...(d.showroomId !== undefined
      ? d.showroomId
        ? { showroom: { connect: { id: d.showroomId } } }
        : { showroom: { disconnect: true } }
      : {}),
  });
  revalidateTags(TAGS.hotlines);
  return ok(toHotlineDto(row));
}

export async function deleteHotline(id: string): Promise<Result<{ ok: true }>> {
  await repo.deleteHotline(id);
  revalidateTags(TAGS.hotlines);
  return ok({ ok: true });
}

export async function listMenuItemsAdmin() {
  return (await repo.listMenuItemsAdmin()).map(toMenuItemDto);
}

export async function createMenuItem(
  input: unknown,
): Promise<Result<MenuItemDto>> {
  const parsed = MenuItemCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid menu item",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.createMenuItem({
    label: d.label,
    routeKey: d.routeKey,
    placement: d.placement,
    sortOrder: d.sortOrder ?? 0,
    visible: d.visible ?? true,
  });
  revalidateTags(TAGS.menu);
  return ok(toMenuItemDto(row));
}

export async function updateMenuItem(
  id: string,
  input: unknown,
): Promise<Result<MenuItemDto>> {
  const parsed = MenuItemUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid menu item update",
      details: parsed.error.flatten(),
    });
  }
  const row = await repo.updateMenuItem(id, parsed.data);
  revalidateTags(TAGS.menu);
  return ok(toMenuItemDto(row));
}

export async function deleteMenuItem(
  id: string,
): Promise<Result<{ ok: true }>> {
  await repo.deleteMenuItem(id);
  revalidateTags(TAGS.menu);
  return ok({ ok: true });
}
