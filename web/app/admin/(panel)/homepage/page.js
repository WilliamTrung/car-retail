import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import MediaPicker from "@/components/admin/MediaPicker";
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
      <h1>Quản lý trang chủ</h1>

      <h2>Banner hero</h2>
      {slides.map((slide) => {
        const title = /** @type {{ vi?: string, en?: string }} */ (slide.title);
        return (
          <div key={slide.id} className={styles.card}>
            <AdminForm action={`/api/admin/hero-slides/${slide.id}`} method="PATCH">
              <LocaleFields prefix="title" label="Tiêu đề" vi={title.vi} en={title.en} />
              <MediaPicker
                name="imageMediaId"
                label="Ảnh nền"
                value={slide.imageMediaId}
                assets={heroMedia}
                folder="HEROES"
              />
              <label>
                Route CTA
                <input name="ctaRouteKey" type="text" defaultValue={slide.ctaRouteKey ?? ""} />
              </label>
              <label>
                Thứ tự
                <input name="sortOrder" type="number" defaultValue={slide.sortOrder} />
              </label>
              <label>
                <input name="published" type="checkbox" value="true" defaultChecked={slide.published} />
                Đã xuất bản
              </label>
            </AdminForm>
          </div>
        );
      })}

      <h2>Thêm banner</h2>
      <AdminForm action="/api/admin/hero-slides" successMessage="Đã thêm banner.">
        <LocaleFields prefix="title" label="Tiêu đề" />
        <MediaPicker name="imageMediaId" label="Ảnh nền" assets={heroMedia} folder="HEROES" />
        <label>
          Route CTA
          <input name="ctaRouteKey" type="text" placeholder="/book-test-drive" />
        </label>
      </AdminForm>

      <h2>Khối dịch vụ</h2>
      {blocks.map((block) => {
        const title = /** @type {{ vi?: string, en?: string }} */ (block.title);
        const desc = /** @type {{ vi?: string, en?: string }} */ (block.description ?? {});
        return (
          <div key={block.id} className={styles.card}>
            <AdminForm action={`/api/admin/service-blocks/${block.id}`} method="PATCH">
              <LocaleFields prefix="title" label="Tiêu đề" vi={title.vi} en={title.en} />
              <LocaleFields prefix="description" label="Mô tả" vi={desc.vi} en={desc.en} multiline />
              <label>
                Route liên kết
                <input name="linkRouteKey" type="text" defaultValue={block.linkRouteKey ?? ""} />
              </label>
            </AdminForm>
          </div>
        );
      })}

      <h2>Thêm khối dịch vụ</h2>
      <AdminForm action="/api/admin/service-blocks" successMessage="Đã thêm khối.">
        <LocaleFields prefix="title" label="Tiêu đề" />
        <LocaleFields prefix="description" label="Mô tả" multiline />
      </AdminForm>
    </>
  );
}
