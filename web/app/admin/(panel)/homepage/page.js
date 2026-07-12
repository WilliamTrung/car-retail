import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import MediaSelect from "@/components/admin/MediaSelect";
import { pickLocale } from "@/lib/attributes";
import styles from "../panel.module.css";

export default async function HomepagePage() {
  const session = await getSession();
  if (!canAccess(session?.role, "homepage")) redirect("/admin");

  const [slides, blocks, heroMedia] = await Promise.all([
    prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.serviceBlock.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.mediaAsset.findMany({
      where: { folder: "HEROES" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <>
      <h1>Homepage CMS</h1>

      <h2>Hero slides</h2>
      {slides.map((slide) => {
        const title = /** @type {{ vi?: string, en?: string }} */ (slide.title);
        return (
          <div key={slide.id} className={styles.card}>
            <AdminForm action={`/api/admin/hero-slides/${slide.id}`} method="PATCH">
              <LocaleFields prefix="title" label="Title" vi={title.vi} en={title.en} />
              <MediaSelect
                name="imageMediaId"
                label="Background image"
                value={slide.imageMediaId}
                assets={heroMedia}
                folder="HEROES"
              />
              <label>
                CTA route key
                <input name="ctaRouteKey" type="text" defaultValue={slide.ctaRouteKey ?? ""} />
              </label>
              <label>
                Sort
                <input name="sortOrder" type="number" defaultValue={slide.sortOrder} />
              </label>
              <label>
                <input name="published" type="checkbox" value="true" defaultChecked={slide.published} />
                Published
              </label>
            </AdminForm>
          </div>
        );
      })}

      <h2>Add hero slide</h2>
      <AdminForm action="/api/admin/hero-slides" successMessage="Slide created.">
        <LocaleFields prefix="title" label="Title" />
        <label>
          CTA route key
          <input name="ctaRouteKey" type="text" placeholder="/book-test-drive" />
        </label>
      </AdminForm>

      <h2>Service blocks</h2>
      {blocks.map((block) => {
        const title = /** @type {{ vi?: string, en?: string }} */ (block.title);
        const desc = /** @type {{ vi?: string, en?: string }} */ (block.description ?? {});
        return (
          <div key={block.id} className={styles.card}>
            <AdminForm action={`/api/admin/service-blocks/${block.id}`} method="PATCH">
              <LocaleFields prefix="title" label="Title" vi={title.vi} en={title.en} />
              <LocaleFields prefix="description" label="Description" vi={desc.vi} en={desc.en} multiline />
              <label>
                Link route
                <input name="linkRouteKey" type="text" defaultValue={block.linkRouteKey ?? ""} />
              </label>
            </AdminForm>
          </div>
        );
      })}

      <h2>Add service block</h2>
      <AdminForm action="/api/admin/service-blocks" successMessage="Block created.">
        <LocaleFields prefix="title" label="Title" />
        <LocaleFields prefix="description" label="Description" multiline />
      </AdminForm>
    </>
  );
}
