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
import { lv } from "@/app/admin/(panel)/_lib/localized";
import {
  createPolicyAction,
  deletePolicyAction,
  updatePolicyAction,
  type PolicyCreateInput,
  type PolicyDto,
} from "./actions";
import styles from "../cms.module.css";

type Props = {
  policies: PolicyDto[];
  mediaUrls: Record<string, string>;
};

export function PoliciesSection({ policies, mediaUrls }: Props) {
  const t = useTranslations("admin.policies");
  const tc = useTranslations("admin.common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PolicyDto | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setEditing(null);
  };

  const remove = async (id: string) => {
    const res = await deletePolicyAction(id);
    if (!res.ok) setRowError(res.error.message);
    else router.refresh();
  };

  const togglePublished = async (policy: PolicyDto) => {
    setRowError(null);
    const res = await updatePolicyAction(policy.id, {
      published: !policy.published,
    });
    if (!res.ok) setRowError(res.error.message);
    else router.refresh();
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>{t("title")}</h2>
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
          t("policyTitle"),
          t("pdf"),
          t("sortOrder"),
          t("status"),
          t("actions"),
        ]}
      >
        {policies.map((policy) => (
          <tr key={policy.id}>
            <td>
              <strong>{policy.title.vi}</strong>
              {policy.title.en ? (
                <span className={styles.secondary}>{policy.title.en}</span>
              ) : null}
            </td>
            <td>{policy.pdfMediaId ? "✓" : "—"}</td>
            <td>{policy.sortOrder}</td>
            <td>
              <button
                type="button"
                role="switch"
                aria-checked={policy.published}
                onClick={() => void togglePublished(policy)}
              >
                {policy.published ? tc("published") : tc("draft")}
              </button>
            </td>
            <td>
              <div className={styles.rowActions}>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(policy);
                    setOpen(true);
                  }}
                >
                  {tc("edit")}
                </button>
                <ConfirmDelete onConfirm={() => remove(policy.id)} />
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
        <PolicyForm
          key={editing?.id ?? "new"}
          policy={editing}
          mediaUrls={mediaUrls}
          onDone={close}
        />
      </AdminModal>
    </section>
  );
}

function PolicyForm({
  policy,
  mediaUrls,
  onDone,
}: {
  policy: PolicyDto | null;
  mediaUrls: Record<string, string>;
  onDone: () => void;
}) {
  const t = useTranslations("admin.policies");
  const tc = useTranslations("admin.common");
  const router = useRouter();
  const [slug, setSlug] = useState(lv(policy?.slug));
  const [title, setTitle] = useState(lv(policy?.title));
  const [bodyVi, setBodyVi] = useState(policy?.body?.vi ?? "");
  const [bodyEn, setBodyEn] = useState(policy?.body?.en ?? "");
  const [pdfMedia, setPdfMedia] = useState<MediaPickerSelection | null>(
    policy?.pdfMediaId
      ? {
          mediaId: policy.pdfMediaId,
          publicUrl: mediaUrls[policy.pdfMediaId] ?? "",
        }
      : null,
  );
  const [sortOrder, setSortOrder] = useState(String(policy?.sortOrder ?? 0));
  const [published, setPublished] = useState(policy?.published ?? true);

  const { state, submit, pending } = useAdminForm(
    (input: PolicyCreateInput) =>
      policy
        ? updatePolicyAction(policy.id, input)
        : createPolicyAction(input),
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
          body: bodyVi || bodyEn ? { vi: bodyVi, en: bodyEn } : null,
          pdfMediaId: pdfMedia?.mediaId ?? null,
          sortOrder: Number(sortOrder) || 0,
          published,
        });
      }}
    >
      <LocalizedField
        id="policy-slug"
        label={t("slug")}
        required
        value={slug}
        onChange={setSlug}
        error={errors.slug}
      />
      <LocalizedField
        id="policy-title"
        label={t("policyTitle")}
        required
        value={title}
        onChange={setTitle}
        error={errors.title}
      />
      <HtmlField
        id="policy-body-vi"
        label={t("bodyVi")}
        value={bodyVi}
        onChange={setBodyVi}
        error={errors.body}
      />
      <HtmlField
        id="policy-body-en"
        label={t("bodyEn")}
        value={bodyEn}
        onChange={setBodyEn}
      />
      <div>
        <span className={styles.muted}>{t("pdf")}</span>
        <MediaPicker
          folder="POLICIES"
          value={pdfMedia}
          onChange={setPdfMedia}
        />
        {pdfMedia ? (
          <button type="button" onClick={() => setPdfMedia(null)}>
            {tc("remove")}
          </button>
        ) : null}
      </div>
      <FormField
        id="policy-sort-order"
        label={t("sortOrder")}
        error={errors.sortOrder}
      >
        <AdminInput
          id="policy-sort-order"
          type="number"
          step="1"
          value={sortOrder}
          error={errors.sortOrder}
          onChange={(e) => setSortOrder(e.currentTarget.value)}
        />
      </FormField>
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
