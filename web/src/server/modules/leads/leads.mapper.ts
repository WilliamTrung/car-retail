import type { Lead, Showroom, VehicleModel, VehicleVariant } from "@prisma/client";
import { LeadPayloadSchema, LocalizedTextSchema, type LeadPayload } from "@/server/db/zod";
import type { LeadDto } from "./leads.schema";

type LeadWithRels = Lead & {
  model?: VehicleModel | null;
  variant?: VehicleVariant | null;
  showroom?: Showroom | null;
};

function pickVi(field: unknown): string {
  if (!field || typeof field !== "object") return "";
  const parsed = LocalizedTextSchema.safeParse(field);
  if (!parsed.success) return "";
  return parsed.data.vi || parsed.data.en || "";
}

export function toLeadDto(row: Lead): LeadDto {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    locale: row.locale,
    payload: LeadPayloadSchema.parse(row.payload),
    modelId: row.modelId,
    variantId: row.variantId,
    showroomId: row.showroomId,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function payloadFields(payload: LeadPayload | unknown) {
  const parsed = LeadPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { name: "", phone: "", email: "" };
  }
  return {
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email ?? "",
  };
}

function csvEscape(value: string | undefined | null): string {
  const s = value ?? "";
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function leadToCsvRow(row: LeadWithRels): string {
  const p = payloadFields(row.payload);
  const cols = [
    row.id,
    row.type,
    row.status,
    row.locale,
    csvEscape(p.name),
    csvEscape(p.phone),
    csvEscape(p.email),
    csvEscape(row.model ? pickVi(row.model.name) : ""),
    csvEscape(row.variant ? pickVi(row.variant.name) : ""),
    csvEscape(row.showroom ? pickVi(row.showroom.name) : ""),
    row.createdAt.toISOString(),
  ];
  return cols.join(",");
}
