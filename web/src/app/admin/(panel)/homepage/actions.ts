"use server";

import { guardAdmin } from "@/app/admin/(panel)/_lib/guard";
import {
  homepageService,
  type DeliveryPhotoCreateInput,
  type DeliveryPhotoDto,
  type DeliveryPhotoUpdateInput,
  type HeroSlideCreateInput,
  type HeroSlideDto,
  type HeroSlideUpdateInput,
  type ServiceBlockCreateInput,
  type ServiceBlockDto,
  type ServiceBlockUpdateInput,
} from "@/server/modules/homepage";
import type { Result } from "@/server/result";

export async function createHeroSlideAction(
  input: unknown,
): Promise<Result<HeroSlideDto>> {
  const gate = await guardAdmin("homepage");
  if (!gate.ok) return gate;
  return homepageService.createHeroSlide(input);
}

export async function updateHeroSlideAction(
  id: string,
  input: unknown,
): Promise<Result<HeroSlideDto>> {
  const gate = await guardAdmin("homepage");
  if (!gate.ok) return gate;
  return homepageService.updateHeroSlide(id, input);
}

export async function deleteHeroSlideAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("homepage");
  if (!gate.ok) return gate;
  return homepageService.deleteHeroSlide(id);
}

export async function createServiceBlockAction(
  input: unknown,
): Promise<Result<ServiceBlockDto>> {
  const gate = await guardAdmin("homepage");
  if (!gate.ok) return gate;
  return homepageService.createServiceBlock(input);
}

export async function updateServiceBlockAction(
  id: string,
  input: unknown,
): Promise<Result<ServiceBlockDto>> {
  const gate = await guardAdmin("homepage");
  if (!gate.ok) return gate;
  return homepageService.updateServiceBlock(id, input);
}

export async function deleteServiceBlockAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("homepage");
  if (!gate.ok) return gate;
  return homepageService.deleteServiceBlock(id);
}

export async function createDeliveryPhotoAction(
  input: unknown,
): Promise<Result<DeliveryPhotoDto>> {
  const gate = await guardAdmin("homepage");
  if (!gate.ok) return gate;
  return homepageService.createDeliveryPhoto(input);
}

export async function updateDeliveryPhotoAction(
  id: string,
  input: unknown,
): Promise<Result<DeliveryPhotoDto>> {
  const gate = await guardAdmin("homepage");
  if (!gate.ok) return gate;
  return homepageService.updateDeliveryPhoto(id, input);
}

export async function deleteDeliveryPhotoAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("homepage");
  if (!gate.ok) return gate;
  return homepageService.deleteDeliveryPhoto(id);
}

export type CreateHeroSlideAction = typeof createHeroSlideAction;
export type UpdateHeroSlideAction = typeof updateHeroSlideAction;
export type DeleteHeroSlideAction = typeof deleteHeroSlideAction;
export type CreateServiceBlockAction = typeof createServiceBlockAction;
export type UpdateServiceBlockAction = typeof updateServiceBlockAction;
export type DeleteServiceBlockAction = typeof deleteServiceBlockAction;
export type CreateDeliveryPhotoAction = typeof createDeliveryPhotoAction;
export type UpdateDeliveryPhotoAction = typeof updateDeliveryPhotoAction;
export type DeleteDeliveryPhotoAction = typeof deleteDeliveryPhotoAction;

export type {
  DeliveryPhotoCreateInput,
  DeliveryPhotoDto,
  DeliveryPhotoUpdateInput,
  HeroSlideCreateInput,
  HeroSlideDto,
  HeroSlideUpdateInput,
  ServiceBlockCreateInput,
  ServiceBlockDto,
  ServiceBlockUpdateInput,
};
