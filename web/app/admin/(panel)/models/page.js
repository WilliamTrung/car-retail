import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import MediaPicker from "@/components/admin/MediaPicker";
import AttributeEditor from "@/components/admin/AttributeEditor";
import { pickLocale } from "@/lib/attributes";
import viMessages from "@/messages/vi.json";
import styles from "../panel.module.css";

export default async function ModelsPage() {
  const session = await getSession();
  if (!canAccess(session?.role, "models")) redirect("/admin");

  const [models, segments, attributeKeys, units, vehicleMedia] = await Promise.all([
    prisma.vehicleModel.findMany({
      include: { segment: { include: { line: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.vehicleSegment.findMany({ include: { line: true }, orderBy: { sortOrder: "asc" } }),
    prisma.attributeKey.findMany({ orderBy: [{ groupKey: "asc" }, { sortOrder: "asc" }] }),
    prisma.unit.findMany({ orderBy: { key: "asc" } }),
    prisma.mediaAsset.findMany({
      where: { folder: "VEHICLES" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <>
      <h1>Danh mục xe</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Phân khúc</th>
            <th>Trạng thái</th>
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
                  {model.published ? "Đã xuất bản" : "Bản nháp"}
                </span>
              </td>
              <td>
                <Link href={`/admin/models/${model.id}`}>Sửa</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Thêm xe</h2>
      <AdminForm action="/api/admin/models" successMessage="Đã tạo xe.">
        <label>
          Phân khúc
          <select name="segmentId" required>
            {segments.map((seg) => (
              <option key={seg.id} value={seg.id}>
                {pickLocale(seg.line.name, "vi")} → {pickLocale(seg.name, "vi")}
              </option>
            ))}
          </select>
        </label>
        <LocaleFields prefix="name" label="Tên" />
        <LocaleFields prefix="slug" label="Slug" />
        <LocaleFields prefix="tagline" label="Tagline" />
        <MediaPicker
          name="heroMediaId"
          label="Ảnh hero"
          assets={vehicleMedia}
          folder="VEHICLES"
        />
        <AttributeEditor attributeKeys={attributeKeys} units={units} specLabels={viMessages.spec} />
        <label>
          <input name="published" type="checkbox" value="true" />
          Đã xuất bản
        </label>
      </AdminForm>
    </>
  );
}
