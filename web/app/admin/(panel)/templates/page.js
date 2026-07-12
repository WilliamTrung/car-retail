import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import DeleteButton from "@/components/admin/DeleteButton";
import TemplateItemsEditor from "@/components/admin/TemplateItemsEditor";
import { pickLocale } from "@/lib/attributes";
import viMessages from "@/messages/vi.json";
import styles from "../panel.module.css";

export default async function TemplatesPage() {
  const session = await getSession();
  if (!canAccess(session?.role, "templates")) redirect("/admin");

  const [templates, attributeKeys, units] = await Promise.all([
    prisma.attributeTemplate.findMany({ orderBy: { key: "asc" } }),
    prisma.attributeKey.findMany({ orderBy: [{ groupKey: "asc" }, { sortOrder: "asc" }] }),
    prisma.unit.findMany({ orderBy: { key: "asc" } }),
  ]);

  return (
    <>
      <h1>Attribute templates</h1>

      {templates.map((tpl) => {
        const name = /** @type {{ vi?: string, en?: string }} */ (tpl.name);
        return (
          <div key={tpl.id} className={styles.card}>
            <AdminForm action={`/api/admin/templates/${tpl.id}`} method="PATCH">
              <label>
                Key
                <input name="key" type="text" defaultValue={tpl.key} required />
              </label>
              <LocaleFields prefix="name" label="Name" vi={name.vi} en={name.en} />
              <TemplateItemsEditor
                value={Array.isArray(tpl.items) ? tpl.items : []}
                attributeKeys={attributeKeys}
                units={units}
                specLabels={viMessages.spec}
              />
            </AdminForm>
            <DeleteButton action={`/api/admin/templates/${tpl.id}`} confirmMessage={`Delete template ${tpl.key}?`} />
          </div>
        );
      })}

      <h2>Add template</h2>
      <AdminForm action="/api/admin/templates" successMessage="Template created.">
        <label>
          Key
          <input name="key" type="text" required />
        </label>
        <LocaleFields prefix="name" label="Name" />
        <TemplateItemsEditor attributeKeys={attributeKeys} units={units} specLabels={viMessages.spec} />
      </AdminForm>
    </>
  );
}
