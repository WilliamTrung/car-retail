import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import { pickLocale } from "@/lib/attributes";
import styles from "../panel.module.css";

export default async function NewsAdminPage() {
  const session = await getSession();
  if (!canAccess(session?.role, "news")) redirect("/admin");

  const posts = await prisma.newsPost.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <>
      <h1>News</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>{pickLocale(post.title, "vi")}</td>
              <td>{post.published ? "Published" : "Draft"}</td>
              <td>
                <Link href={`/admin/news/${post.id}`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>New post</h2>
      <AdminForm action="/api/admin/news" successMessage="Post created.">
        <LocaleFields prefix="slug" label="Slug" />
        <LocaleFields prefix="title" label="Title" />
        <LocaleFields prefix="excerpt" label="Excerpt" multiline />
        <LocaleFields prefix="body" label="Body" multiline />
        <label>
          <input name="published" type="checkbox" value="true" />
          Publish
        </label>
      </AdminForm>
    </>
  );
}
