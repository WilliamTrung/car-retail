import { z } from "zod";
import { LeadPayloadSchema } from "@/server/db/zod";

export const LeadTypeSchema = z.enum(["TEST_DRIVE", "DEPOSIT", "CONSULT"]);
export type LeadTypeDto = z.infer<typeof LeadTypeSchema>;

export const LeadStatusSchema = z.enum(["NEW", "CONTACTED", "CLOSED"]);
export type LeadStatusDto = z.infer<typeof LeadStatusSchema>;

/** Public / form create — consent must be true; name + phone required. */
export const CreateLeadInputSchema = z.object({
  type: LeadTypeSchema,
  locale: z.enum(["vi", "en"]),
  payload: LeadPayloadSchema.extend({
    name: z.string().trim().min(1, "Name is required"),
    phone: z.string().trim().min(1, "Phone is required"),
    consent: z.literal(true, {
      error: "Consent is required",
    }),
  }),
  modelId: z.string().min(1).nullable().optional(),
  variantId: z.string().min(1).nullable().optional(),
  showroomId: z.string().min(1).nullable().optional(),
});
export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>;

export const UpdateLeadStatusInputSchema = z.object({
  status: LeadStatusSchema,
  notes: z.string().nullable().optional(),
});
export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusInputSchema>;

export const LeadDtoSchema = z.object({
  id: z.string(),
  type: LeadTypeSchema,
  status: LeadStatusSchema,
  locale: z.string(),
  payload: LeadPayloadSchema,
  modelId: z.string().nullable(),
  variantId: z.string().nullable(),
  showroomId: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type LeadDto = z.infer<typeof LeadDtoSchema>;

/** CSV column header (stable contract for admin export). */
export const LEAD_CSV_COLUMNS = [
  "id",
  "type",
  "status",
  "locale",
  "name",
  "phone",
  "email",
  "model",
  "variant",
  "showroom",
  "createdAt",
] as const;
