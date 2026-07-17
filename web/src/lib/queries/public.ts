/**
 * Public read facade for legacy JSX components — delegates to the service layer.
 * ponytail: thin transport adapter; components bind here until TS migration.
 */
import type { MediaAsset } from "@prisma/client";
import { attributesService } from "@/server/modules/attributes";
import { contentService } from "@/server/modules/content";
import { homepageService } from "@/server/modules/homepage";
import { settingsService } from "@/server/modules/settings";
import { showroomsService } from "@/server/modules/showrooms";
import { vehiclesService } from "@/server/modules/vehicles";

type MediaRow = Pick<
  MediaAsset,
  "id" | "publicUrl" | "altText" | "mimeType" | "r2Key"
>;

export async function getSiteSettings() {
  const row = await settingsService.getSiteSettingsPublic();
  if (!row) return null;
  return row;
}

export async function getMenuItems(placement: "HEADER" | "FOOTER") {
  return settingsService.getMenuItemsPublic(placement);
}

export async function getUnits() {
  return attributesService.getUnitsPublic();
}

export async function getPublishedModels() {
  return vehiclesService.getPublishedModels();
}

export async function getHeroSlides() {
  return homepageService.getHeroSlides();
}

export async function getServiceBlocks() {
  return homepageService.getServiceBlocks();
}

export async function getDeliveryPhotos() {
  return homepageService.getDeliveryPhotos();
}

export async function getFeaturedNews(limit = 3) {
  return contentService.getFeaturedNews(limit);
}

export async function getAllNews() {
  return contentService.getAllNews();
}

export async function getShowrooms() {
  return showroomsService.getShowroomsPublic();
}

export async function getHotlines() {
  return settingsService.getHotlinesPublic();
}

export async function getGlobalFaqs() {
  return contentService.getGlobalFaqs();
}

export async function getPolicies() {
  return contentService.getPolicies();
}

export async function getPageByType(pageType: string) {
  return contentService.getPageByType(pageType);
}

export async function getModelBySlug(locale: string, slug: string) {
  return vehiclesService.getModelBySlug(locale, slug);
}

export async function getNewsBySlug(locale: string, slug: string) {
  return contentService.getNewsBySlug(locale, slug);
}

export async function getModelWithDetails(id: string) {
  return vehiclesService.getModelWithDetails(id);
}

export type { MediaRow };
