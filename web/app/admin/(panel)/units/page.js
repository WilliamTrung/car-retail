import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import DeleteButton from "@/components/admin/DeleteButton";
import { pickLocale } from "@/lib/attributes";
import styles from "../panel.module.css";

export default async function UnitsPage() {
  const session = await getSession();
  if (!canAccess(session?.role, "units")) redirect("/admin");

  const units = await prisma.unit.findMany({ orderBy: { key: "asc" } });

  return (
    <>
      <h1>Units catalog</h1>

      {units.map((unit) => {
        const value = /** @type {{ vi?: string, en?: string }} */ (unit.value);
        return (
          <div key={unit.id} className={styles.card}>
            <AdminForm action={`/api/admin/units/${unit.id}`} method="PATCH">
              <label>
                Key
                <input name="key" type="text" defaultValue={unit.key} required />
              </label>
              <LocaleFields prefix="value" label="Display value" vi={value.vi} en={value.en} />
            </AdminForm>
            <DeleteButton action={`/api/admin/units/${unit.id}`} confirmMessage={`Delete unit ${unit.key}?`} />
          </div>
        );
      })}

      <h2>Add unit</h2>
      <AdminForm action="/api/admin/units" successMessage="Unit created.">
        <label>
          Key
          <input name="key" type="text" required placeholder="km" />
        </label>
        <LocaleFields prefix="value" label="Display value" />
      </AdminForm>
    </>
  );
}
