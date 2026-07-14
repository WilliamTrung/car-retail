import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import MediaPicker from "@/components/admin/MediaPicker";
import { pickLocale } from "@/lib/attributes";
import { a } from "@/lib/admin/strings";
import styles from "../panel.module.css";

export default async function NewsAdminPage() {
  const session = await getSession();
  if (!canAccess(session?.role, "news")) redirect("/admin");

  const [posts, newsMedia] = await Promise.all([
    prisma.newsPost.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.mediaAsset.findMany({
      where: { folder: "NEWS" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <>
      <h1>Tin tức</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Trạng thái</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>{pickLocale(post.title, "vi")}</td>
              <td>{post.published ? a.published : a.draft}</td>
              <td>
                <Link href={`/admin/news/${post.id}`}>{a.edit}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Bài viết mới</h2>
      <AdminForm action="/api/admin/news" successMessage="Đã tạo bài viết.">
        <LocaleFields prefix="slug" label="Slug" />
        <LocaleFields prefix="title" label="Tiêu đề" />
        <LocaleFields prefix="excerpt" label="Tóm tắt" multiline />
        <LocaleFields prefix="body" label="Nội dung" multiline />
        <MediaPicker
          name="featuredMediaId"
          label="Ảnh đại diện"
          assets={newsMedia}
          folder="NEWS"
        />
        <label>
          <input name="published" type="checkbox" value="true" />
          Xuất bản
        </label>
      </AdminForm>
    </>
  );
}
