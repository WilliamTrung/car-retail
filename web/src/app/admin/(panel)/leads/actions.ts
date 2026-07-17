"use server";

import { guardAdmin } from "@/app/admin/(panel)/_lib/guard";
import {
  leadsService,
  type LeadDto,
  type UpdateLeadStatusInput,
} from "@/server/modules/leads";
import { ok, type Result } from "@/server/result";

export async function listLeadsAction(opts?: {
  take?: number;
}): Promise<Result<LeadDto[]>> {
  const gate = await guardAdmin("leads");
  if (!gate.ok) return gate;
  const rows = await leadsService.listLeads(opts);
  return ok(rows);
}

export async function updateLeadStatusAction(
  id: string,
  input: unknown,
): Promise<Result<LeadDto>> {
  const gate = await guardAdmin("leads");
  if (!gate.ok) return gate;
  return leadsService.updateStatus(id, input);
}

export async function exportLeadsCsvAction(opts?: {
  take?: number;
}): Promise<Result<{ csv: string }>> {
  const gate = await guardAdmin("leads");
  if (!gate.ok) return gate;
  const csv = await leadsService.exportCsv(opts);
  return ok({ csv });
}

export type ListLeadsAction = typeof listLeadsAction;
export type UpdateLeadStatusAction = typeof updateLeadStatusAction;
export type ExportLeadsCsvAction = typeof exportLeadsCsvAction;

export type { LeadDto, UpdateLeadStatusInput };
