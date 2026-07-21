"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AdminInput,
  AdminModal,
  AdminTable,
  ConfirmDelete,
  HtmlField,
  LocalizedField,
  useAdminForm,
} from "@/components/admin";
import { FormField } from "@/components/ui/FormField";
import { hasLoc, lv } from "@/app/[locale]/(admin)/admin/(panel)/_lib/localized";
import {
  createPageAction,
  deletePageAction,
  updatePageAction,
  type PageCreateInput,
  type PageDto,
} from "./actions";
import styles from "../cms.module.css";

export function PagesSection({ pages }: { pages: PageDto[] }) {
  const t = useTranslations("admin.pages");
  const tc = useTranslations("admin.common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PageDto | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setEditing(null);
  };

  const remove = async (id: string) => {
    const res = await deletePageAction(id);
    if (!res.ok) setRowError(res.error.message);
    else router.refresh();
  };

  const togglePublished = async (page: PageDto) => {
    setRowError(null);
    const res = await updatePageAction(page.id, {
      published: !page.published,
    });
    if (!res.ok) setRowError(res.error.message);
    else router.refresh();
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>{t("tab_pages")}</h2>
        <button
          type="button"
          className={styles.primary}
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          {t("add")}
        </button>
      </div>
      {rowError ? (
        <p className={styles.error} role="alert">
          {rowError}
        </p>
      ) : null}
      <AdminTable
        headers={[
          t("pageType"),
          t("pageTitle"),
          t("status"),
          t("actions"),
        ]}
      >
        {pages.map((page) => (
          <tr key={page.id}>
            <td>
              <code>{page.pageType}</code>
            </td>
            <td>
              <strong>{page.title.vi}</strong>
              {page.title.en ? (
                <span className={styles.secondary}>{page.title.en}</span>
              ) : null}
            </td>
            <td>
              <button
                type="button"
                role="switch"
                aria-checked={page.published}
                onClick={() => void togglePublished(page)}
              >
                {page.published ? tc("published") : tc("draft")}
              </button>
            </td>
            <td>
              <div className={styles.rowActions}>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(page);
                    setOpen(true);
                  }}
                >
                  {tc("edit")}
                </button>
                <ConfirmDelete onConfirm={() => remove(page.id)} />
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <AdminModal
        open={open}
        onClose={close}
        title={editing ? t("editTitle") : t("createTitle")}
      >
        <PageForm
          key={editing?.id ?? "new"}
          page={editing}
          existing={pages}
          onDone={close}
        />
      </AdminModal>
    </section>
  );
}

function PageForm({
  page,
  existing,
  onDone,
}: {
  page: PageDto | null;
  existing: PageDto[];
  onDone: () => void;
}) {
  const t = useTranslations("admin.pages");
  const tc = useTranslations("admin.common");
  const router = useRouter();
  const [pageType, setPageType] = useState(page?.pageType ?? "");
  const [typeError, setTypeError] = useState<string | null>(null);
  const [slug, setSlug] = useState(lv(page?.slug));
  const [title, setTitle] = useState(lv(page?.title));
  const [bodyVi, setBodyVi] = useState(page?.body.vi ?? "");
  const [bodyEn, setBodyEn] = useState(page?.body.en ?? "");
  const [metaTitle, setMetaTitle] = useState(
    lv(page?.meta && { vi: page.meta.vi.title, en: page.meta.en.title }),
  );
  const [metaDescription, setMetaDescription] = useState(
    lv(
      page?.meta && {
        vi: page.meta.vi.description,
        en: page.meta.en.description,
      },
    ),
  );
  const [published, setPublished] = useState(page?.published ?? true);

  const { state, submit, pending } = useAdminForm(
    (input: PageCreateInput) =>
      page ? updatePageAction(page.id, input) : createPageAction(input),
    {
      onSuccess: () => {
        router.refresh();
        onDone();
      },
    },
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        const type = pageType.trim();
        // pageType is DB-unique — pre-check against the loaded list so the
        // duplicate error surfaces inline instead of a server exception.
        if (existing.some((p) => p.pageType === type && p.id !== page?.id)) {
          setTypeError(t("duplicateType"));
          return;
        }
        setTypeError(null);
        submit({
          pageType: type,
          slug,
          title,
          body: { vi: bodyVi, en: bodyEn },
          meta:
            hasLoc(metaTitle) || hasLoc(metaDescription)
              ? {
                  vi: {
                    title: metaTitle.vi,
                    description: metaDescription.vi,
                  },
                  en: {
                    title: metaTitle.en,
                    description: metaDescription.en,
                  },
                }
              : null,
          published,
        });
      }}
    >
      <FormField
        id="page-type"
        label={t("pageType")}
        required
        hint={t("pageTypeHint")}
        error={typeError ?? errors.pageType}
      >
        <AdminInput
          id="page-type"
          required
          value={pageType}
          error={typeError ?? errors.pageType}
          onChange={(e) => {
            setPageType(e.currentTarget.value);
            setTypeError(null);
          }}
        />
      </FormField>
      <LocalizedField
        id="page-slug"
        label={t("slug")}
        required
        value={slug}
        onChange={setSlug}
        error={errors.slug}
      />
      <LocalizedField
        id="page-title"
        label={t("pageTitle")}
        required
        value={title}
        onChange={setTitle}
        error={errors.title}
      />
      <HtmlField
        id="page-body-vi"
        label={t("bodyVi")}
        required
        value={bodyVi}
        onChange={setBodyVi}
        error={errors.body}
      />
      <HtmlField
        id="page-body-en"
        label={t("bodyEn")}
        value={bodyEn}
        onChange={setBodyEn}
      />
      <LocalizedField
        id="page-meta-title"
        label={t("metaTitle")}
        value={metaTitle}
        onChange={setMetaTitle}
        error={errors.meta}
      />
      <LocalizedField
        id="page-meta-description"
        label={t("metaDescription")}
        multiline
        value={metaDescription}
        onChange={setMetaDescription}
      />
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.currentTarget.checked)}
        />
        {tc("published")}
      </label>
      {state.status === "error" && !state.fieldErrors ? (
        <p className={styles.error} role="alert">
          {state.message ?? tc("error")}
        </p>
      ) : null}
      <div className={styles.actions}>
        <button type="button" disabled={pending} onClick={onDone}>
          {tc("cancel")}
        </button>
        <button type="submit" className={styles.primary} disabled={pending}>
          {tc("save")}
        </button>
      </div>
    </form>
  );
}
