import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import MediaSelect from "@/components/admin/MediaSelect";
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
      <h1>Edit — {pickLocale(title, "vi")}</h1>
      <AdminForm action={`/api/admin/news/${id}`} method="PATCH">
        <LocaleFields prefix="slug" label="Slug" vi={slug.vi} en={slug.en} />
        <LocaleFields prefix="title" label="Title" vi={title.vi} en={title.en} />
        <LocaleFields prefix="excerpt" label="Excerpt" vi={excerpt.vi} en={excerpt.en} multiline />
        <LocaleFields prefix="body" label="Body" vi={body.vi} en={body.en} multiline />
        <MediaSelect
          name="featuredMediaId"
          label="Featured image (OG fallback)"
          value={post.featuredMediaId}
          assets={newsMedia}
          folder="NEWS"
        />
        <label>
          OG image media ID override (optional JSON meta)
          <input
            name="meta"
            type="text"
            defaultValue={JSON.stringify(meta)}
            placeholder='{"vi":{"ogImageMediaId":"..."}}'
          />
        </label>
        <label>
          <input name="published" type="checkbox" value="true" defaultChecked={post.published} />
          Published
        </label>
        <label>
          <input name="featured" type="checkbox" value="true" defaultChecked={post.featured} />
          Featured on home
        </label>
      </AdminForm>
    </>
  );
}
