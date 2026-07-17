import type { Showroom } from "@prisma/client";
import { LocalizedTextSchema, type LocalizedText } from "@/server/db/zod";
import type { ShowroomDto } from "./showrooms.schema";

function loc(value: unknown): LocalizedText {
  return LocalizedTextSchema.parse(value);
}

function locNull(value: unknown): LocalizedText | null {
  if (value == null) return null;
  return LocalizedTextSchema.parse(value);
}

export function toShowroomDto(row: Showroom): ShowroomDto {
  return {
    id: row.id,
    name: loc(row.name),
    address: loc(row.address),
    city: row.city,
    phone: row.phone,
    hours: locNull(row.hours),
    typeTag: row.typeTag,
    lat: row.lat,
    lng: row.lng,
    sortOrder: row.sortOrder,
    published: row.published,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
