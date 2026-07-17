"use client";

import { useActionState } from "react";
import type { Result } from "@/server/result";

export type AdminFormStatus = "idle" | "submitting" | "success" | "error";

export type AdminFormState = {
  status: AdminFormStatus;
  /** First Zod message per field (VALIDATION_ERROR details.fieldErrors). */
  fieldErrors?: Record<string, string>;
  message?: string;
};

type ZodFlattened = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
};

function toFieldErrors(details: unknown): Record<string, string> | undefined {
  const flat = details as ZodFlattened | null | undefined;
  if (!flat || typeof flat !== "object" || !flat.fieldErrors) return undefined;
  const out: Record<string, string> = {};
  for (const [field, messages] of Object.entries(flat.fieldErrors)) {
    const first = messages?.[0];
    if (first) out[field] = first;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Wraps React 19 `useActionState` around a `Result<T>`-returning server
 * action. `submit` works both as `<form action={submit}>` (FormData payload)
 * and called directly with a typed input.
 */
export function useAdminForm<TData, TPayload = FormData>(
  action: (payload: TPayload) => Promise<Result<TData>>,
  options?: { onSuccess?: (data: TData) => void },
): {
  state: AdminFormState;
  submit: (payload: TPayload) => void;
  pending: boolean;
} {
  const [state, submit, pending] = useActionState<AdminFormState, TPayload>(
    async (_prev, payload) => {
      const result = await action(payload);
      if (result.ok) {
        options?.onSuccess?.(result.data);
        return { status: "success" };
      }
      return {
        status: "error",
        message: result.error.message,
        fieldErrors:
          result.error.code === "VALIDATION_ERROR"
            ? toFieldErrors(result.error.details)
            : undefined,
      };
    },
    { status: "idle" },
  );

  return {
    state: pending ? { ...state, status: "submitting" } : state,
    submit,
    pending,
  };
}
