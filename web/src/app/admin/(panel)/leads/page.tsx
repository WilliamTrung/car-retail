import { requireAdmin } from "@/server/auth/session";
import { leadsService } from "@/server/modules/leads";

/** Minimal unstyled leads list — proves leads service after POST /api/leads. */
export default async function AdminLeadsPage() {
  await requireAdmin("leads");
  const leads = await leadsService.listLeads({ take: 50 });

  return (
    <main>
      <h1>Leads</h1>
      <ul data-testid="leads-list">
        {leads.map((lead) => (
          <li key={lead.id} data-lead-id={lead.id}>
            {lead.id} — {lead.type} —{" "}
            {typeof lead.payload === "object" &&
            lead.payload &&
            "name" in lead.payload
              ? String((lead.payload as { name?: string }).name ?? "")
              : ""}
          </li>
        ))}
      </ul>
    </main>
  );
}
