import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import MediaSelect from "@/components/admin/MediaSelect";
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
      include: { variants: { orderBy: { sortOrder: "asc" } } },
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
  const templateOptions = templates.map((t) => ({
    id: t.id,
    key: t.key,
    label: pickLocale(t.name, "vi"),
  }));

  return (
    <>
      <h1>Edit model — {pickLocale(name, "vi")}</h1>

      <ApplyTemplateButton modelId={id} templates={templateOptions} />

      <AdminForm action={`/api/admin/models/${id}`} method="PATCH">
        <LocaleFields prefix="name" label="Name" vi={name.vi} en={name.en} />
        <LocaleFields prefix="slug" label="Slug" vi={slug.vi} en={slug.en} />
        <LocaleFields prefix="tagline" label="Tagline" vi={tagline.vi} en={tagline.en} />
        <LocaleFields prefix="description" label="Description" vi={description.vi} en={description.en} multiline />
        <MediaSelect name="heroMediaId" label="Hero image" value={model.heroMediaId} assets={vehicleMedia} folder="VEHICLES" />
        <AttributeEditor
          value={Array.isArray(model.attributes) ? model.attributes : []}
          attributeKeys={attributeKeys}
          units={units}
          specLabels={viMessages.spec}
        />
        <label>
          Sort order
          <input name="sortOrder" type="number" defaultValue={model.sortOrder} />
        </label>
        <label>
          <input name="published" type="checkbox" value="true" defaultChecked={model.published} />
          Published
        </label>
      </AdminForm>

      <h2>Variants</h2>
      {model.variants.map((v) => {
        const vName = /** @type {{ vi?: string, en?: string }} */ (v.name);
        return (
          <div key={v.id} className={styles.card}>
            <AdminForm action={`/api/admin/variants/${v.id}`} method="PATCH">
              <LocaleFields prefix="name" label="Name" vi={vName.vi} en={vName.en} />
              <label>
                Price (VND)
                <input name="price" type="text" defaultValue={v.price?.toString() ?? ""} />
              </label>
              <label>
                Sort order
                <input name="sortOrder" type="number" defaultValue={v.sortOrder} />
              </label>
              <label>
                <input type="hidden" name="published" value="false" />
                <input name="published" type="checkbox" value="true" defaultChecked={v.published} />
                Published
              </label>
              <label>
                <input type="hidden" name="allowTestDrive" value="false" />
                <input name="allowTestDrive" type="checkbox" value="true" defaultChecked={v.allowTestDrive} />
                Allow test drive
              </label>
              <label>
                <input type="hidden" name="allowDeposit" value="false" />
                <input name="allowDeposit" type="checkbox" value="true" defaultChecked={v.allowDeposit} />
                Allow deposit
              </label>
            </AdminForm>
            <DeleteButton action={`/api/admin/variants/${v.id}`} confirmMessage="Delete variant?" />
          </div>
        );
      })}

      <h2>Add variant</h2>
      <AdminForm action={`/api/admin/models/${id}/variants`} successMessage="Variant created.">
        <LocaleFields prefix="name" label="Name" />
        <label>
          Price (VND)
          <input name="price" type="text" />
        </label>
        <label>
          <input name="published" type="checkbox" value="true" defaultChecked />
          Published
        </label>
      </AdminForm>
    </>
  );
}
