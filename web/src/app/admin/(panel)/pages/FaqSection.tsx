"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AdminInput,
  AdminModal,
  AdminTable,
  ConfirmDelete,
  LocalizedField,
  useAdminForm,
} from "@/components/admin";
import { FormField } from "@/components/ui/FormField";
import { lv } from "@/app/admin/(panel)/_lib/localized";
import {
  createFaqAction,
  deleteFaqAction,
  updateFaqAction,
  type FaqCreateInput,
  type FaqDto,
} from "./actions";
import styles from "../cms.module.css";

export function FaqSection({ faqs }: { faqs: FaqDto[] }) {
  const t = useTranslations("admin.faq");
  const tc = useTranslations("admin.common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FaqDto | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setEditing(null);
  };

  const remove = async (id: string) => {
    const res = await deleteFaqAction(id);
    if (!res.ok) setRowError(res.error.message);
    else router.refresh();
  };

  const togglePublished = async (faq: FaqDto) => {
    setRowError(null);
    const res = await updateFaqAction(faq.id, { published: !faq.published });
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
        headers={[t("question"), t("sortOrder"), t("status"), t("actions")]}
      >
        {faqs.map((faq) => (
          <tr key={faq.id}>
            <td>
              <strong>{faq.question.vi}</strong>
              {faq.question.en ? (
                <span className={styles.secondary}>{faq.question.en}</span>
              ) : null}
            </td>
            <td>{faq.sortOrder}</td>
            <td>
              <button
                type="button"
                role="switch"
                aria-checked={faq.published}
                onClick={() => void togglePublished(faq)}
              >
                {faq.published ? tc("published") : tc("draft")}
              </button>
            </td>
            <td>
              <div className={styles.rowActions}>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(faq);
                    setOpen(true);
                  }}
                >
                  {tc("edit")}
                </button>
                <ConfirmDelete onConfirm={() => remove(faq.id)} />
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
        <FaqForm key={editing?.id ?? "new"} faq={editing} onDone={close} />
      </AdminModal>
    </section>
  );
}

function FaqForm({ faq, onDone }: { faq: FaqDto | null; onDone: () => void }) {
  const t = useTranslations("admin.faq");
  const tc = useTranslations("admin.common");
  const router = useRouter();
  const [question, setQuestion] = useState(lv(faq?.question));
  const [answer, setAnswer] = useState(lv(faq?.answer));
  const [sortOrder, setSortOrder] = useState(String(faq?.sortOrder ?? 0));
  const [published, setPublished] = useState(faq?.published ?? true);

  const { state, submit, pending } = useAdminForm(
    (input: FaqCreateInput) =>
      faq ? updateFaqAction(faq.id, input) : createFaqAction(input),
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
          question,
          answer,
          sortOrder: Number(sortOrder) || 0,
          published,
        });
      }}
    >
      <LocalizedField
        id="faq-question"
        label={t("question")}
        required
        value={question}
        onChange={setQuestion}
        error={errors.question}
      />
      <LocalizedField
        id="faq-answer"
        label={t("answer")}
        required
        multiline
        value={answer}
        onChange={setAnswer}
        error={errors.answer}
      />
      <FormField
        id="faq-sort-order"
        label={t("sortOrder")}
        error={errors.sortOrder}
      >
        <AdminInput
          id="faq-sort-order"
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
