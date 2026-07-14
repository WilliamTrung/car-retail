import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import MediaPicker from "@/components/admin/MediaPicker";
import { pickLocale } from "@/lib/attributes";

/** @param {{ params: Promise<{ id: string }> }} props */
export default async function NewsEditPage({ params }) {
  const session = await getSession();
  if (!canAccess(session?.role, "news")) redirect("/admin");

  const { id } = await params;
  const [post, newsMedia] = await Promise.all([
    prisma.newsPost.findUnique({ where: { id } }),
    prisma.mediaAsset.findMany({
      where: { folder: "NEWS" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);
  if (!post) notFound();

  const slug = /** @type {{ vi?: string, en?: string }} */ (post.slug);
  const title = /** @type {{ vi?: string, en?: string }} */ (post.title);
  const excerpt = /** @type {{ vi?: string, en?: string }} */ (post.excerpt ?? {});
  const body = /** @type {{ vi?: string, en?: string }} */ (post.body);
  const meta = /** @type {{ vi?: { ogImageMediaId?: string }, en?: { ogImageMediaId?: string } }} */ (post.meta ?? {});

  return (
    <>
      <h1>Sửa tin — {pickLocale(title, "vi")}</h1>
      <AdminForm action={`/api/admin/news/${id}`} method="PATCH">
        <LocaleFields prefix="slug" label="Slug" vi={slug.vi} en={slug.en} />
        <LocaleFields prefix="title" label="Tiêu đề" vi={title.vi} en={title.en} />
        <LocaleFields prefix="excerpt" label="Tóm tắt" vi={excerpt.vi} en={excerpt.en} multiline />
        <LocaleFields prefix="body" label="Nội dung" vi={body.vi} en={body.en} multiline />
        <MediaPicker
          name="featuredMediaId"
          label="Ảnh đại diện"
          value={post.featuredMediaId}
          assets={newsMedia}
          folder="NEWS"
        />
        <MediaPicker
          name="metaOgImageVi"
          label="Ảnh OG (VI)"
          value={meta.vi?.ogImageMediaId}
          assets={newsMedia}
          folder="NEWS"
        />
        <MediaPicker
          name="metaOgImageEn"
          label="Ảnh OG (EN)"
          value={meta.en?.ogImageMediaId}
          assets={newsMedia}
          folder="NEWS"
        />
        <label>
          <input name="published" type="checkbox" value="true" defaultChecked={post.published} />
          Đã xuất bản
        </label>
        <label>
          <input name="featured" type="checkbox" value="true" defaultChecked={post.featured} />
          Nổi bật trang chủ
        </label>
      </AdminForm>
    </>
  );
}
