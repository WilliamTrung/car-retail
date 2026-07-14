import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import LeadStatusForm from "@/components/admin/LeadStatusForm";
import ExportLeadsButton from "@/components/admin/ExportLeadsButton";
import { pickLocale } from "@/lib/attributes";
import styles from "../panel.module.css";

export default async function LeadsPage() {
  const session = await getSession();
  if (!canAccess(session?.role, "leads")) redirect("/admin");

  const leads = await prisma.lead.findMany({
    include: { model: true, variant: true, showroom: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <h1>Hộp thư khách hàng</h1>
      <p className={styles.actions}>
        <ExportLeadsButton />
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Loại</th>
            <th>Liên hệ</th>
            <th>Xe</th>
            <th>Trạng thái</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const p = /** @type {{ name?: string, phone?: string, email?: string }} */ (lead.payload);
            return (
              <tr key={lead.id}>
                <td>{lead.createdAt.toLocaleDateString("vi-VN")}</td>
                <td>{lead.type}</td>
                <td>
                  {p.name}
                  <br />
                  <span className={styles.muted}>{p.phone}</span>
                </td>
                <td>{lead.model ? pickLocale(lead.model.name, lead.locale) : "—"}</td>
                <td>{lead.status}</td>
                <td>
                  <LeadStatusForm leadId={lead.id} status={lead.status} notes={lead.notes ?? ""} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
