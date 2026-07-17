import type { Prisma } from "@prisma/client";
import { logger } from "@/server/logger";
import { err, ok, type Result } from "@/server/result";
import { leadToCsvRow, toLeadDto } from "./leads.mapper";
import * as repo from "./leads.repository";
import {
  CreateLeadInputSchema,
  LEAD_CSV_COLUMNS,
  UpdateLeadStatusInputSchema,
  type LeadDto,
} from "./leads.schema";

/**
 * Stub notify hook — transport may wrap with `after()`.
 * Service stays transport-free (no Request / after).
 */
export async function notifyLeadCreated(lead: LeadDto): Promise<void> {
  logger.info(
    { leadId: lead.id, type: lead.type, locale: lead.locale },
    "lead.created (notify stub)",
  );
}

export async function create(input: unknown): Promise<Result<LeadDto>> {
  const parsed = CreateLeadInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid lead",
      details: parsed.error.flatten(),
    });
  }

  const d = parsed.data;
  const row = await repo.create({
    type: d.type,
    locale: d.locale,
    payload: d.payload as Prisma.InputJsonValue,
    ...(d.modelId ? { model: { connect: { id: d.modelId } } } : {}),
    ...(d.variantId ? { variant: { connect: { id: d.variantId } } } : {}),
    ...(d.showroomId ? { showroom: { connect: { id: d.showroomId } } } : {}),
  });

  // Notify is transport's job via `after()` — keep service free of response lifecycle.
  return ok(toLeadDto(row));
}

export async function updateStatus(
  id: string,
  input: unknown,
): Promise<Result<LeadDto>> {
  const parsed = UpdateLeadStatusInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid lead status update",
      details: parsed.error.flatten(),
    });
  }

  const existing = await repo.findById(id);
  if (!existing) {
    return err({ code: "NOT_FOUND", message: "Lead not found" });
  }

  const row = await repo.update(id, {
    status: parsed.data.status,
    ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
  });
  return ok(toLeadDto(row));
}

export async function listLeads(opts?: { take?: number }) {
  const rows = await repo.list(opts);
  return rows.map(toLeadDto);
}

/** CSV string with header matching `LEAD_CSV_COLUMNS`. */
export async function exportCsv(opts?: { take?: number }): Promise<string> {
  const rows = await repo.list(opts);
  const header = LEAD_CSV_COLUMNS.join(",");
  const body = rows.map(leadToCsvRow).join("\n");
  return `${header}\n${body}`;
}
