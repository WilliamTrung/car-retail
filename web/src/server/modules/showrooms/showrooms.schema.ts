import { z } from "zod";
import {
  LocalizedTextSchema,
  LocalizedTextOptionalSchema,
} from "@/server/db/zod";

export const ShowroomCreateSchema = z.object({
  name: LocalizedTextSchema,
  address: LocalizedTextSchema,
  city: z.string().min(1),
  phone: z.string().nullable().optional(),
  hours: LocalizedTextOptionalSchema,
  typeTag: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});
export type ShowroomCreateInput = z.infer<typeof ShowroomCreateSchema>;
export const ShowroomUpdateSchema = ShowroomCreateSchema.partial();
export type ShowroomUpdateInput = z.infer<typeof ShowroomUpdateSchema>;

export const ShowroomDtoSchema = z.object({
  id: z.string(),
  name: LocalizedTextSchema,
  address: LocalizedTextSchema,
  city: z.string(),
  phone: z.string().nullable(),
  hours: LocalizedTextSchema.nullable(),
  typeTag: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  sortOrder: z.number().int(),
  published: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type ShowroomDto = z.infer<typeof ShowroomDtoSchema>;
