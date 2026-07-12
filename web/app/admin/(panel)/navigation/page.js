import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import DeleteButton from "@/components/admin/DeleteButton";
import { pickLocale } from "@/lib/attributes";
import styles from "../panel.module.css";

export default async function NavigationPage() {
  const session = await getSession();
  if (!canAccess(session?.role, "navigation")) redirect("/admin");

  const items = await prisma.menuItem.findMany({
    orderBy: [{ placement: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <>
      <h1>Navigation</h1>
      <p className={styles.muted}>Route keys use internal paths: /news, /about, /book-test-drive, etc. FOOTER items appear in the site footer quick links.</p>

      {items.map((item) => {
        const label = /** @type {{ vi?: string, en?: string }} */ (item.label);
        return (
          <div key={item.id} className={styles.card}>
            <AdminForm action={`/api/admin/menu-items/${item.id}`} method="PATCH">
              <LocaleFields prefix="label" label="Label" vi={label.vi} en={label.en} />
              <label>
                Route key
                <input name="routeKey" type="text" defaultValue={item.routeKey} required />
              </label>
              <label>
                Placement
                <select name="placement" defaultValue={item.placement}>
                  <option value="HEADER">HEADER</option>
                  <option value="FOOTER">FOOTER</option>
                </select>
              </label>
              <label>
                Sort order
                <input name="sortOrder" type="number" defaultValue={item.sortOrder} />
              </label>
              <label>
                <input name="visible" type="checkbox" value="true" defaultChecked={item.visible} />
                Visible
              </label>
            </AdminForm>
            <DeleteButton action={`/api/admin/menu-items/${item.id}`} confirmMessage="Delete menu item?" />
          </div>
        );
      })}

      <h2>Add menu item</h2>
      <AdminForm action="/api/admin/menu-items" successMessage="Menu item created.">
        <LocaleFields prefix="label" label="Label" />
        <label>
          Route key
          <input name="routeKey" type="text" required placeholder="/news" />
        </label>
        <label>
          Placement
          <select name="placement" defaultValue="HEADER">
            <option value="HEADER">HEADER</option>
            <option value="FOOTER">FOOTER</option>
          </select>
        </label>
        <label>
          Sort order
          <input name="sortOrder" type="number" defaultValue={0} />
        </label>
      </AdminForm>
    </>
  );
}
