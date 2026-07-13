import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import AdminNav from "@/components/admin/AdminNav";
import panelStyles from "./panel.module.css";

export default async function AdminPanelLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className={panelStyles.panelContainer}>
      <AdminNav session={session} />
      <main className={panelStyles.mainContent}>
        <div className={panelStyles.contentInner}>
          {children}
        </div>
      </main>
    </div>
  );
}
