import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { pickLocale } from "@/lib/attributes";

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR", "SALES"]);
  if (error) return error;

  const leads = await prisma.lead.findMany({
    include: { model: true, variant: true, showroom: true },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const header = "id,type,status,locale,name,phone,email,model,variant,showroom,createdAt\n";
  const rows = leads.map((lead) => {
    const p = /** @type {{ name?: string, phone?: string, email?: string }} */ (lead.payload);
    const cols = [
      lead.id,
      lead.type,
      lead.status,
      lead.locale,
      csvEscape(p.name),
      csvEscape(p.phone),
      csvEscape(p.email),
      csvEscape(lead.model ? pickLocale(lead.model.name, "vi") : ""),
      csvEscape(lead.variant ? pickLocale(lead.variant.name, "vi") : ""),
      csvEscape(lead.showroom ? pickLocale(lead.showroom.name, "vi") : ""),
      lead.createdAt.toISOString(),
    ];
    return cols.join(",");
  });

  return new NextResponse(header + rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads.csv"',
    },
  });
}

/** @param {string | undefined} value */
function csvEscape(value) {
  const s = value ?? "";
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
