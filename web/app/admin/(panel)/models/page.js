import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import AttributeEditor from "@/components/admin/AttributeEditor";
import { pickLocale } from "@/lib/attributes";
import viMessages from "@/messages/vi.json";
import styles from "../panel.module.css";

export default async function ModelsPage() {
  const session = await getSession();
  if (!canAccess(session?.role, "models")) redirect("/admin");

  const [models, segments, attributeKeys, units] = await Promise.all([
    prisma.vehicleModel.findMany({
      include: { segment: { include: { line: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.vehicleSegment.findMany({ include: { line: true }, orderBy: { sortOrder: "asc" } }),
    prisma.attributeKey.findMany({ orderBy: [{ groupKey: "asc" }, { sortOrder: "asc" }] }),
    prisma.unit.findMany({ orderBy: { key: "asc" } }),
  ]);

  return (
    <>
      <h1>Vehicle catalog</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Segment</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr key={model.id}>
              <td>{pickLocale(model.name, "vi")}</td>
              <td>{pickLocale(model.segment.name, "vi")}</td>
              <td>
                <span className={`${styles.badge} ${model.published ? styles.badgePublished : styles.badgeDraft}`}>
                  {model.published ? "Published" : "Draft"}
                </span>
              </td>
              <td>
                <Link href={`/admin/models/${model.id}`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Add model</h2>
      <AdminForm action="/api/admin/models" successMessage="Model created.">
        <label>
          Segment
          <select name="segmentId" required>
            {segments.map((seg) => (
              <option key={seg.id} value={seg.id}>
                {pickLocale(seg.line.name, "vi")} → {pickLocale(seg.name, "vi")}
              </option>
            ))}
          </select>
        </label>
        <LocaleFields prefix="name" label="Name" />
        <LocaleFields prefix="slug" label="Slug" />
        <LocaleFields prefix="tagline" label="Tagline" />
        <AttributeEditor attributeKeys={attributeKeys} units={units} specLabels={viMessages.spec} />
        <label>
          <input name="published" type="checkbox" value="true" />
          Published
        </label>
      </AdminForm>
    </>
  );
}
