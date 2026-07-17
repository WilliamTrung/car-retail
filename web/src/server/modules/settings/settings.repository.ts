import type { MenuPlacement, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export async function getSiteSettings() {
  return prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    include: { logoMedia: true, faviconMedia: true },
  });
}

export async function updateSiteSettings(data: Prisma.SiteSettingsUpdateInput) {
  return prisma.siteSettings.update({
    where: { id: "singleton" },
    data,
  });
}

export async function listHotlines() {
  return prisma.hotline.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function createHotline(data: Prisma.HotlineCreateInput) {
  return prisma.hotline.create({ data });
}

export async function updateHotline(
  id: string,
  data: Prisma.HotlineUpdateInput,
) {
  return prisma.hotline.update({ where: { id }, data });
}

export async function deleteHotline(id: string) {
  return prisma.hotline.delete({ where: { id } });
}

export async function listMenuItems(placement?: MenuPlacement) {
  return prisma.menuItem.findMany({
    where: {
      ...(placement ? { placement } : {}),
      visible: true,
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listMenuItemsAdmin() {
  return prisma.menuItem.findMany({
    orderBy: [{ placement: "asc" }, { sortOrder: "asc" }],
  });
}

export async function createMenuItem(data: Prisma.MenuItemCreateInput) {
  return prisma.menuItem.create({ data });
}

export async function updateMenuItem(
  id: string,
  data: Prisma.MenuItemUpdateInput,
) {
  return prisma.menuItem.update({ where: { id }, data });
}

export async function deleteMenuItem(id: string) {
  return prisma.menuItem.delete({ where: { id } });
}
