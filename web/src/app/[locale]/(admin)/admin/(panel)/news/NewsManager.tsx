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
  MediaPicker,
  useAdminForm,
  type MediaPickerSelection,
} from "@/components/admin";
import { FormField } from "@/components/ui/FormField";
import { dateToLocalInput, hasLoc, lv } from "@/app/[locale]/(admin)/admin/(panel)/_lib/localized";
import {
  createNewsAction,
  deleteNewsAction,
  updateNewsAction,
  type NewsCreateInput,
  type NewsDto,
} from "./actions";
import styles from "../cms.module.css";

type Props = {
  posts: NewsDto[];
  /** mediaId → publicUrl, to preview the current featured image when editing. */
  mediaUrls: Record<string, string>;
};

export function NewsManager({ posts, mediaUrls }: Props) {
  const t = useTranslations("admin.news");
  const tc = useTranslations("admin.common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NewsDto | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setEditing(null);
  };

  const remove = async (id: string) => {
    const res = await deleteNewsAction(id);
    if (!res.ok) setRowError(res.error.message);
    else router.refresh();
  };

  const togglePublished = async (post: NewsDto) => {
    setRowError(null);
    const res = await updateNewsAction(post.id, {
      published: !post.published,
    });
    if (!res.ok) setRowError(res.error.message);
    else router.refresh();
  };

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>{t("title")}</h1>
          <p className={styles.muted}>{t("description")}</p>
        </div>
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
          t("postTitle"),
          t("publishedAt"),
          t("featured"),
          t("status"),
          t("actions"),
        ]}
      >
        {posts.map((post) => (
          <tr key={post.id}>
            <td>
              <strong>{post.title.vi}</strong>
              {post.title.en ? (
                <span className={styles.secondary}>{post.title.en}</span>
              ) : null}
            </td>
            <td>
              {post.publishedAt
                ? post.publishedAt.toISOString().slice(0, 10)
                : "—"}
            </td>
            <td>{post.featured ? "✓" : "—"}</td>
            <td>
              <button
                type="button"
                role="switch"
                aria-checked={post.published}
                onClick={() => void togglePublished(post)}
              >
                {post.published ? tc("published") : tc("draft")}
              </button>
            </td>
            <td>
              <div className={styles.rowActions}>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(post);
                    setOpen(true);
                  }}
                >
                  {tc("edit")}
                </button>
                <ConfirmDelete onConfirm={() => remove(post.id)} />
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
        <NewsForm
          key={editing?.id ?? "new"}
          post={editing}
          mediaUrls={mediaUrls}
          onDone={close}
        />
      </AdminModal>
    </section>
  );
}

function NewsForm({
  post,
  mediaUrls,
  onDone,
}: {
  post: NewsDto | null;
  mediaUrls: Record<string, string>;
  onDone: () => void;
}) {
  const t = useTranslations("admin.news");
  const tc = useTranslations("admin.common");
  const router = useRouter();
  const [slug, setSlug] = useState(lv(post?.slug));
  const [title, setTitle] = useState(lv(post?.title));
  const [excerpt, setExcerpt] = useState(lv(post?.excerpt));
  const [bodyVi, setBodyVi] = useState(post?.body.vi ?? "");
  const [bodyEn, setBodyEn] = useState(post?.body.en ?? "");
  const [metaTitle, setMetaTitle] = useState(
    lv(post?.meta && { vi: post.meta.vi.title, en: post.meta.en.title }),
  );
  const [metaDescription, setMetaDescription] = useState(
    lv(
      post?.meta && {
        vi: post.meta.vi.description,
        en: post.meta.en.description,
      },
    ),
  );
  const [featuredMedia, setFeaturedMedia] =
    useState<MediaPickerSelection | null>(
      post?.featuredMediaId
        ? {
            mediaId: post.featuredMediaId,
            publicUrl: mediaUrls[post.featuredMediaId] ?? "",
          }
        : null,
    );
  const [publishedAt, setPublishedAt] = useState(
    dateToLocalInput(post?.publishedAt),
  );
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [published, setPublished] = useState(post?.published ?? false);

  const { state, submit, pending } = useAdminForm(
    (input: NewsCreateInput) =>
      post ? updateNewsAction(post.id, input) : createNewsAction(input),
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
        submit({
          slug,
          title,
          excerpt: hasLoc(excerpt) ? excerpt : null,
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
          featuredMediaId: featuredMedia?.mediaId ?? null,
          publishedAt: publishedAt ? new Date(publishedAt) : null,
          featured,
          published,
        });
      }}
    >
      <LocalizedField
        id="news-slug"
        label={t("slug")}
        required
        value={slug}
        onChange={setSlug}
        error={errors.slug}
      />
      <LocalizedField
        id="news-title"
        label={t("postTitle")}
        required
        value={title}
        onChange={setTitle}
        error={errors.title}
      />
      <LocalizedField
        id="news-excerpt"
        label={t("excerpt")}
        multiline
        value={excerpt}
        onChange={setExcerpt}
        error={errors.excerpt}
      />
      <HtmlField
        id="news-body-vi"
        label={t("bodyVi")}
        required
        value={bodyVi}
        onChange={setBodyVi}
        error={errors.body}
      />
      <HtmlField
        id="news-body-en"
        label={t("bodyEn")}
        value={bodyEn}
        onChange={setBodyEn}
      />
      <LocalizedField
        id="news-meta-title"
        label={t("metaTitle")}
        value={metaTitle}
        onChange={setMetaTitle}
        error={errors.meta}
      />
      <LocalizedField
        id="news-meta-description"
        label={t("metaDescription")}
        multiline
        value={metaDescription}
        onChange={setMetaDescription}
      />
      <div>
        <span className={styles.muted}>{t("featuredImage")}</span>
        <MediaPicker
          folder="NEWS"
          value={featuredMedia}
          onChange={setFeaturedMedia}
        />
        {featuredMedia ? (
          <button type="button" onClick={() => setFeaturedMedia(null)}>
            {tc("remove")}
          </button>
        ) : null}
      </div>
      <FormField
        id="news-published-at"
        label={t("publishedAt")}
        error={errors.publishedAt}
      >
        <AdminInput
          id="news-published-at"
          type="datetime-local"
          value={publishedAt}
          error={errors.publishedAt}
          onChange={(e) => setPublishedAt(e.currentTarget.value)}
        />
      </FormField>
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.currentTarget.checked)}
        />
        {t("featured")}
      </label>
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
