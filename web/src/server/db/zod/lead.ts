import { z } from "zod";

/**
 * Lead.payload Json — form fields from test-drive / deposit / consult.
 * Extra keys allowed for forward compatibility.
 */
export const LeadPayloadSchema = z
  .object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.union([z.string().email(), z.literal("")]).optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    consent: z.boolean(),
    note: z.string().optional(),
    modelSlug: z.string().optional(),
    variantId: z.string().optional(),
    showroomId: z.string().optional(),
  })
  .passthrough();

export type LeadPayload = z.infer<typeof LeadPayloadSchema>;
