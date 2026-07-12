import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import LocaleFields from "@/components/admin/LocaleFields";
import { pickLocale } from "@/lib/attributes";
import styles from "../panel.module.css";

const PAGE_TYPES = ["about", "contact"];

export default async function PagesAdminPage() {
  const session = await getSession();
  if (!canAccess(session?.role, "pages")) redirect("/admin");

  const [pages, faqs, policies] = await Promise.all([
    prisma.page.findMany({ orderBy: { pageType: "asc" } }),
    prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.policyDocument.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <>
      <h1>Static pages & FAQ</h1>

      {PAGE_TYPES.map((pageType) => {
        const page = pages.find((p) => p.pageType === pageType);
        const title = /** @type {{ vi?: string, en?: string }} */ (page?.title ?? {});
        const body = /** @type {{ vi?: string, en?: string }} */ (page?.body ?? {});
        const slug = /** @type {{ vi?: string, en?: string }} */ (page?.slug ?? {});
        return (
          <div key={pageType} className={styles.card}>
            <h2>{pageType}</h2>
            <AdminForm action="/api/admin/pages" method="PATCH">
              <input type="hidden" name="pageType" value={pageType} />
              <LocaleFields prefix="slug" label="Slug" vi={slug.vi} en={slug.en} />
              <LocaleFields prefix="title" label="Title" vi={title.vi} en={title.en} />
              <LocaleFields prefix="body" label="Body" vi={body.vi} en={body.en} multiline />
            </AdminForm>
          </div>
        );
      })}

      <h2>FAQ items</h2>
      {faqs.map((faq) => {
        const q = /** @type {{ vi?: string, en?: string }} */ (faq.question);
        const a = /** @type {{ vi?: string, en?: string }} */ (faq.answer);
        return (
          <div key={faq.id} className={styles.card}>
            <AdminForm action={`/api/admin/faqs/${faq.id}`} method="PATCH">
              <LocaleFields prefix="question" label="Question" vi={q.vi} en={q.en} />
              <LocaleFields prefix="answer" label="Answer" vi={a.vi} en={a.en} multiline />
            </AdminForm>
          </div>
        );
      })}

      <AdminForm action="/api/admin/faqs" successMessage="FAQ added.">
        <LocaleFields prefix="question" label="New question" />
        <LocaleFields prefix="answer" label="Answer" multiline />
      </AdminForm>

      <h2>Policies</h2>
      {policies.map((doc) => (
        <div key={doc.id} className={styles.card}>
          <strong>{pickLocale(doc.title, "vi")}</strong>
        </div>
      ))}

      <AdminForm action="/api/admin/policies" successMessage="Policy added.">
        <LocaleFields prefix="slug" label="Slug" />
        <LocaleFields prefix="title" label="Title" />
        <LocaleFields prefix="body" label="Body" multiline />
      </AdminForm>
    </>
  );
}
