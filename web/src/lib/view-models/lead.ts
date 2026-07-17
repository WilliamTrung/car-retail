import type { CreateLeadInput } from "@/server/modules/leads/leads.schema";
import type { Locale } from "./common";

export type LeadType = "TEST_DRIVE" | "DEPOSIT" | "CONSULT";

export interface LeadFormValues {
  type: LeadType;
  fullName: string;
  phone: string;
  consent: true;
  modelId?: string | null;
  showroomId?: string | null;
  province?: string | null;
  preferredDate?: string | null;
  note?: string | null;
  locale: Locale;
}

export type LeadSubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

/** Map form VM → API CreateLeadInput (compile-checked assignability). */
export function toCreateLeadInput(values: LeadFormValues): CreateLeadInput {
  const payload: CreateLeadInput["payload"] = {
    name: values.fullName,
    phone: values.phone,
    consent: values.consent,
  };
  if (values.note) payload.note = values.note;
  if (values.preferredDate) payload.date = values.preferredDate;
  if (values.province) {
    (payload as Record<string, unknown>).province = values.province;
  }

  const input: CreateLeadInput = {
    type: values.type,
    locale: values.locale,
    payload,
    modelId: values.modelId ?? null,
    showroomId: values.showroomId ?? null,
  };
  return input;
}
