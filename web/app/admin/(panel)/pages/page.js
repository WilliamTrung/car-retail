import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import MediaPicker from "@/components/admin/MediaPicker";
import { pickLocale } from "@/lib/attributes";
import styles from "../panel.module.css";

const PAGE_TYPES = ["about", "contact"];

export default async function PagesAdminPage() {
  const session = await getSession();
  if (!canAccess(session?.role, "pages")) redirect("/admin");

  const [pages, faqs, policies, policyMedia] = await Promise.all([
    prisma.page.findMany({ orderBy: { pageType: "asc" } }),
    prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.policyDocument.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.mediaAsset.findMany({
      where: { folder: "POLICIES" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <>
      <h1>Trang tĩnh & FAQ</h1>

      {PAGE_TYPES.map((pageType) => {
        const page = pages.find((p) => p.pageType === pageType);
        const title = /** @type {{ vi?: string, en?: string }} */ (page?.title ?? {});
        const body = /** @type {{ vi?: string, en?: string }} */ (page?.body ?? {});
        const slug = /** @type {{ vi?: string, en?: string }} */ (page?.slug ?? {});
        return (
          <div key={pageType} className={styles.card}>
            <h2>{pageType === "about" ? "Giới thiệu" : "Liên hệ"}</h2>
            <AdminForm action="/api/admin/pages" method="PATCH">
              <input type="hidden" name="pageType" value={pageType} />
              <LocaleFields prefix="slug" label="Slug" vi={slug.vi} en={slug.en} />
              <LocaleFields prefix="title" label="Tiêu đề" vi={title.vi} en={title.en} />
              <LocaleFields prefix="body" label="Nội dung" vi={body.vi} en={body.en} multiline />
            </AdminForm>
          </div>
        );
      })}

      <h2>Câu hỏi thường gặp</h2>
      {faqs.map((faq) => {
        const q = /** @type {{ vi?: string, en?: string }} */ (faq.question);
        const ans = /** @type {{ vi?: string, en?: string }} */ (faq.answer);
        return (
          <div key={faq.id} className={styles.card}>
            <AdminForm action={`/api/admin/faqs/${faq.id}`} method="PATCH">
              <LocaleFields prefix="question" label="Câu hỏi" vi={q.vi} en={q.en} />
              <LocaleFields prefix="answer" label="Trả lời" vi={ans.vi} en={ans.en} multiline />
            </AdminForm>
          </div>
        );
      })}

      <AdminForm action="/api/admin/faqs" successMessage="Đã thêm FAQ.">
        <LocaleFields prefix="question" label="Câu hỏi mới" />
        <LocaleFields prefix="answer" label="Trả lời" multiline />
      </AdminForm>

      <h2>Chính sách</h2>
      {policies.map((doc) => {
        const slug = /** @type {{ vi?: string, en?: string }} */ (doc.slug);
        const title = /** @type {{ vi?: string, en?: string }} */ (doc.title);
        const body = /** @type {{ vi?: string, en?: string }} */ (doc.body ?? {});
        return (
          <div key={doc.id} className={styles.card}>
            <AdminForm action={`/api/admin/policies/${doc.id}`} method="PATCH">
              <LocaleFields prefix="slug" label="Slug" vi={slug.vi} en={slug.en} />
              <LocaleFields prefix="title" label="Tiêu đề" vi={title.vi} en={title.en} />
              <LocaleFields prefix="body" label="Nội dung" vi={body.vi} en={body.en} multiline />
              <MediaPicker
                name="pdfMediaId"
                label="Tệp PDF"
                value={doc.pdfMediaId}
                assets={policyMedia}
                folder="POLICIES"
                accept="application/pdf,image/*"
              />
              <label>
                Thứ tự
                <input name="sortOrder" type="number" defaultValue={doc.sortOrder} />
              </label>
              <label>
                <input name="published" type="checkbox" value="true" defaultChecked={doc.published} />
                Đã xuất bản
              </label>
            </AdminForm>
          </div>
        );
      })}

      <AdminForm action="/api/admin/policies" successMessage="Đã thêm chính sách.">
        <LocaleFields prefix="slug" label="Slug" />
        <LocaleFields prefix="title" label="Tiêu đề" />
        <LocaleFields prefix="body" label="Nội dung" multiline />
        <MediaPicker
          name="pdfMediaId"
          label="Tệp PDF"
          assets={policyMedia}
          folder="POLICIES"
          accept="application/pdf,image/*"
        />
      </AdminForm>
    </>
  );
}
