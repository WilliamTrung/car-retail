import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import RichHtmlFields from "@/components/admin/RichHtmlFields";
import MediaPicker from "@/components/admin/MediaPicker";
import GalleryPicker from "@/components/admin/GalleryPicker";
import DeleteButton from "@/components/admin/DeleteButton";
import ApplyTemplateButton from "@/components/admin/ApplyTemplateButton";
import AttributeEditor from "@/components/admin/AttributeEditor";
import { pickLocale } from "@/lib/attributes";
import viMessages from "@/messages/vi.json";
import styles from "../../panel.module.css";

/** @param {{ params: Promise<{ id: string }> }} props */
export default async function ModelEditPage({ params }) {
  const session = await getSession();
  if (!canAccess(session?.role, "models")) redirect("/admin");

  const { id } = await params;
  const [model, templates, vehicleMedia, attributeKeys, units] = await Promise.all([
    prisma.vehicleModel.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { sortOrder: "asc" } },
        featureSections: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.attributeTemplate.findMany({ orderBy: { key: "asc" } }),
    prisma.mediaAsset.findMany({
      where: { folder: "VEHICLES" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.attributeKey.findMany({ orderBy: [{ groupKey: "asc" }, { sortOrder: "asc" }] }),
    prisma.unit.findMany({ orderBy: { key: "asc" } }),
  ]);
  if (!model) notFound();

  const name = /** @type {{ vi?: string, en?: string }} */ (model.name);
  const slug = /** @type {{ vi?: string, en?: string }} */ (model.slug);
  const tagline = /** @type {{ vi?: string, en?: string }} */ (model.tagline ?? {});
  const description = /** @type {{ vi?: string, en?: string }} */ (model.description ?? {});
  const gallery = Array.isArray(model.gallery) ? model.gallery.filter((id) => typeof id === "string") : [];
  const templateOptions = templates.map((t) => ({
    id: t.id,
    key: t.key,
    label: pickLocale(t.name, "vi"),
  }));

  return (
    <>
      <h1>Sửa xe — {pickLocale(name, "vi")}</h1>

      <ApplyTemplateButton modelId={id} templates={templateOptions} />

      <AdminForm action={`/api/admin/models/${id}`} method="PATCH">
        <LocaleFields prefix="name" label="Tên" vi={name.vi} en={name.en} />
        <LocaleFields prefix="slug" label="Slug" vi={slug.vi} en={slug.en} />
        <LocaleFields prefix="tagline" label="Tagline" vi={tagline.vi} en={tagline.en} />
        <RichHtmlFields prefix="description" label="Mô tả" vi={description.vi} en={description.en} />
        <MediaPicker
          name="heroMediaId"
          label="Ảnh hero"
          value={model.heroMediaId}
          assets={vehicleMedia}
          folder="VEHICLES"
        />
        <GalleryPicker value={gallery} assets={vehicleMedia} folder="VEHICLES" />
        <AttributeEditor
          value={Array.isArray(model.attributes) ? model.attributes : []}
          attributeKeys={attributeKeys}
          units={units}
          specLabels={viMessages.spec}
        />
        <label>
          Thứ tự
          <input name="sortOrder" type="number" defaultValue={model.sortOrder} />
        </label>
        <label>
          <input name="published" type="checkbox" value="true" defaultChecked={model.published} />
          Đã xuất bản
        </label>
      </AdminForm>

      {model.featureSections.length > 0 ? (
        <>
          <h2>Khối tính năng</h2>
          {model.featureSections.map((section) => {
            const sTitle = /** @type {{ vi?: string, en?: string }} */ (section.title);
            const sBody = /** @type {{ vi?: string, en?: string }} */ (section.body ?? {});
            return (
              <div key={section.id} className={styles.card}>
                <AdminForm action={`/api/admin/feature-sections/${section.id}`} method="PATCH">
                  <LocaleFields prefix="title" label="Tiêu đề" vi={sTitle.vi} en={sTitle.en} />
                  <RichHtmlFields prefix="body" label="Nội dung" vi={sBody.vi} en={sBody.en} />
                  <MediaPicker
                    name="imageMediaId"
                    label="Ảnh minh họa"
                    value={section.imageMediaId}
                    assets={vehicleMedia}
                    folder="VEHICLES"
                  />
                  <label>
                    Thứ tự
                    <input name="sortOrder" type="number" defaultValue={section.sortOrder} />
                  </label>
                </AdminForm>
              </div>
            );
          })}
        </>
      ) : null}

      <h2>Phiên bản</h2>
      {model.variants.map((v) => {
        const vName = /** @type {{ vi?: string, en?: string }} */ (v.name);
        return (
          <div key={v.id} className={styles.card}>
            <AdminForm action={`/api/admin/variants/${v.id}`} method="PATCH">
              <LocaleFields prefix="name" label="Tên" vi={vName.vi} en={vName.en} />
              <label>
                Giá (VND)
                <input name="price" type="text" defaultValue={v.price?.toString() ?? ""} />
              </label>
              <label>
                Thứ tự
                <input name="sortOrder" type="number" defaultValue={v.sortOrder} />
              </label>
              <label>
                <input type="hidden" name="published" value="false" />
                <input name="published" type="checkbox" value="true" defaultChecked={v.published} />
                Đã xuất bản
              </label>
              <label>
                <input type="hidden" name="allowTestDrive" value="false" />
                <input name="allowTestDrive" type="checkbox" value="true" defaultChecked={v.allowTestDrive} />
                Cho phép lái thử
              </label>
              <label>
                <input type="hidden" name="allowDeposit" value="false" />
                <input name="allowDeposit" type="checkbox" value="true" defaultChecked={v.allowDeposit} />
                Cho phép đặt cọc
              </label>
            </AdminForm>
            <DeleteButton action={`/api/admin/variants/${v.id}`} confirmMessage="Xóa phiên bản?" />
          </div>
        );
      })}

      <h2>Thêm phiên bản</h2>
      <AdminForm action={`/api/admin/models/${id}/variants`} successMessage="Đã thêm phiên bản.">
        <LocaleFields prefix="name" label="Tên" />
        <label>
          Giá (VND)
          <input name="price" type="text" />
        </label>
        <label>
          <input name="published" type="checkbox" value="true" defaultChecked />
          Đã xuất bản
        </label>
      </AdminForm>
    </>
  );
}
