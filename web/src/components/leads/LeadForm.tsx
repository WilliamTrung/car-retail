"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CreateLeadInputSchema } from "@/server/modules/leads/leads.schema";
import type { Locale } from "@/lib/view-models/common";
import {
  toCreateLeadInput,
  type LeadFormValues,
  type LeadSubmitState,
  type LeadType,
} from "@/lib/view-models/lead";
import { Button } from "@/components/ui/Button";
import { ConsentCheckbox } from "@/components/ui/ConsentCheckbox";
import { FormField, formControlA11y } from "@/components/ui/FormField";
import { Icon } from "@/components/ui/Icon";
import styles from "./LeadForm.module.css";

export type LeadFormPreset = "consult" | "test_drive" | "deposit";

export type LeadFormOption = { id: string; name: string };

export type LeadFormProps = {
  preset: LeadFormPreset;
  /** Defaults to active next-intl locale when omitted (home band). */
  locale?: Locale;
  models: LeadFormOption[];
  showrooms?: LeadFormOption[];
  provinces?: LeadFormOption[];
  defaultModelId?: string;
  defaultShowroomId?: string;
  hotlineDisplay?: string;
  hotlineTel?: string;
  /** Compact consult band (home) — hides card chrome title when false. */
  showTitle?: boolean;
  className?: string;
};

const PRESET_TYPE: Record<LeadFormPreset, LeadType> = {
  consult: "CONSULT",
  test_drive: "TEST_DRIVE",
  deposit: "DEPOSIT",
};

const VN_PHONE = /^(0|\+84)\d{9}$/;

type FieldKey =
  | "fullName"
  | "phone"
  | "consent"
  | "preferredDate"
  | "modelId"
  | "showroomId"
  | "province"
  | "note";

function stripPhone(value: string): string {
  return value.replace(/\s+/g, "");
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function LeadForm({
  preset,
  locale: localeProp,
  models,
  showrooms = [],
  provinces = [],
  defaultModelId = "",
  defaultShowroomId = "",
  hotlineDisplay = "1900 23 45 67",
  hotlineTel = "tel:1900234567",
  showTitle = true,
  className,
}: LeadFormProps) {
  const t = useTranslations("forms");
  const localeFromHook = useLocale();
  const locale: Locale = localeProp ?? (localeFromHook === "en" ? "en" : "vi");
  const leadType = PRESET_TYPE[preset];

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [modelId, setModelId] = useState(defaultModelId);
  const [showroomId, setShowroomId] = useState(defaultShowroomId);
  const [province, setProvince] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>(
    {},
  );
  const [submitState, setSubmitState] = useState<LeadSubmitState>({
    status: "idle",
  });

  const isTestDrive = preset === "test_drive";
  const isDeposit = preset === "deposit";
  const isConsult = preset === "consult";
  const submitting = submitState.status === "submitting";

  function clearFieldError(key: FieldKey) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validateField(key: FieldKey, value: string | boolean): string | null {
    switch (key) {
      case "fullName": {
        const v = String(value).trim();
        if (v.length < 2) return t("errors.fullName");
        return null;
      }
      case "phone": {
        const cleaned = stripPhone(String(value));
        if (!VN_PHONE.test(cleaned)) return t("errors.phone");
        return null;
      }
      case "consent":
        if (value !== true) return t("errors.consent");
        return null;
      case "preferredDate": {
        if (!isTestDrive) return null;
        const v = String(value);
        if (!v) return null;
        if (v < todayIso()) return t("errors.preferredDate");
        return null;
      }
      default:
        return null;
    }
  }

  function validateAll(): Partial<Record<FieldKey, string>> {
    const errors: Partial<Record<FieldKey, string>> = {};
    const nameErr = validateField("fullName", fullName);
    if (nameErr) errors.fullName = nameErr;
    const phoneErr = validateField("phone", phone);
    if (phoneErr) errors.phone = phoneErr;
    const consentErr = validateField("consent", consent);
    if (consentErr) errors.consent = consentErr;
    if (isTestDrive) {
      const dateErr = validateField("preferredDate", preferredDate);
      if (dateErr) errors.preferredDate = dateErr;
    }
    return errors;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const errors = validateAll();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitState({ status: "idle" });
      return;
    }
    if (!consent) {
      setFieldErrors({ consent: t("errors.consent") });
      return;
    }

    const values: LeadFormValues = {
      type: leadType,
      fullName: fullName.trim(),
      phone: stripPhone(phone),
      consent: true,
      locale,
      modelId: modelId || null,
      showroomId: isTestDrive ? showroomId || null : null,
      province: isTestDrive ? province || null : null,
      preferredDate: isTestDrive ? preferredDate || null : null,
      note: isTestDrive || isDeposit ? note.trim() || null : null,
    };

    const input = toCreateLeadInput(values);
    const parsed = CreateLeadInputSchema.safeParse(input);
    if (!parsed.success) {
      setSubmitState({
        status: "error",
        message: t("errors.generic"),
      });
      return;
    }

    setSubmitState({ status: "submitting" });

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (res.status === 429) {
        setSubmitState({ status: "error", message: t("errors.rateLimited") });
        return;
      }

      if (!res.ok) {
        setSubmitState({
          status: "error",
          message: t("errors.server", { hotline: hotlineDisplay }),
        });
        return;
      }

      setSubmitState({ status: "success" });
    } catch {
      // Never clear entered values on error
      setSubmitState({
        status: "error",
        message: t("errors.network", { hotline: hotlineDisplay }),
      });
    }
  }

  const submitLabel =
    preset === "consult"
      ? t("submitConsult")
      : preset === "deposit"
        ? t("submitDeposit")
        : t("submitTestDrive");

  const modelLabel = isConsult ? t("modelInterest") : t("model");

  if (submitState.status === "success") {
    return (
      <div
        className={[styles.card, styles.success, className].filter(Boolean).join(" ")}
        role="status"
      >
        <span className={styles.successIcon} aria-hidden>
          <Icon name="check" size={20} />
        </span>
        <h2 className={styles.successTitle}>{t("successTitle")}</h2>
        <p className={styles.successBody}>
          {t("successBody", { hotline: hotlineDisplay })}
        </p>
      </div>
    );
  }

  return (
    <div
      className={[
        styles.card,
        isConsult && styles.compact,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showTitle ? (
        <h2 className={styles.cardTitle}>{t("formCardTitle")}</h2>
      ) : null}

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <div className={styles.row}>
          <FormField
            id="lead-fullName"
            label={t("fullName")}
            required
            error={fieldErrors.fullName}
          >
            <input
              {...formControlA11y("lead-fullName", fieldErrors.fullName)}
              name="fullName"
              autoComplete="name"
              placeholder={t("placeholders.fullName")}
              value={fullName}
              disabled={submitting}
              onChange={(e) => {
                setFullName(e.target.value);
                clearFieldError("fullName");
              }}
              onBlur={() => {
                const err = validateField("fullName", fullName);
                if (err) setFieldErrors((p) => ({ ...p, fullName: err }));
              }}
            />
          </FormField>

          <FormField
            id="lead-phone"
            label={t("phone")}
            required
            error={fieldErrors.phone}
          >
            <input
              {...formControlA11y("lead-phone", fieldErrors.phone)}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t("placeholders.phone")}
              value={phone}
              disabled={submitting}
              onChange={(e) => {
                setPhone(e.target.value);
                clearFieldError("phone");
              }}
              onBlur={() => {
                const err = validateField("phone", phone);
                if (err) setFieldErrors((p) => ({ ...p, phone: err }));
              }}
            />
          </FormField>
        </div>

        {isTestDrive ? (
          <div className={styles.row}>
            <FormField id="lead-province" label={t("province")}>
              <select
                {...formControlA11y("lead-province")}
                name="province"
                value={province}
                disabled={submitting}
                onChange={(e) => setProvince(e.target.value)}
              >
                <option value="">{t("placeholders.select")}</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="lead-showroom" label={t("showroom")}>
              <select
                {...formControlA11y("lead-showroom")}
                name="showroomId"
                value={showroomId}
                disabled={submitting}
                onChange={(e) => setShowroomId(e.target.value)}
              >
                <option value="">{t("placeholders.select")}</option>
                {showrooms.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        ) : null}

        <div className={isTestDrive ? styles.row : undefined}>
          <FormField id="lead-model" label={modelLabel}>
            <select
              {...formControlA11y("lead-model")}
              name="modelId"
              value={modelId}
              disabled={submitting}
              onChange={(e) => setModelId(e.target.value)}
            >
              <option value="">{t("placeholders.select")}</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </FormField>

          {isTestDrive ? (
            <FormField
              id="lead-preferredDate"
              label={t("preferredDate")}
              error={fieldErrors.preferredDate}
            >
              <input
                {...formControlA11y(
                  "lead-preferredDate",
                  fieldErrors.preferredDate,
                )}
                name="preferredDate"
                type="date"
                min={todayIso()}
                value={preferredDate}
                disabled={submitting}
                onChange={(e) => {
                  setPreferredDate(e.target.value);
                  clearFieldError("preferredDate");
                }}
                onBlur={() => {
                  const err = validateField("preferredDate", preferredDate);
                  if (err)
                    setFieldErrors((p) => ({ ...p, preferredDate: err }));
                }}
              />
            </FormField>
          ) : null}
        </div>

        {isTestDrive || isDeposit ? (
          <FormField id="lead-note" label={t("note")}>
            <textarea
              {...formControlA11y("lead-note")}
              name="note"
              rows={3}
              placeholder={t("placeholders.note")}
              value={note}
              disabled={submitting}
              onChange={(e) => setNote(e.target.value)}
            />
          </FormField>
        ) : null}

        <ConsentCheckbox
          id="lead-consent"
          checked={consent}
          invalid={Boolean(fieldErrors.consent)}
          error={fieldErrors.consent}
          labelBefore={t("consentBefore")}
          privacyLabel={t("consentPrivacy")}
          labelAfter={t("consentAfter")}
          onChange={(checked: boolean) => {
            setConsent(checked);
            clearFieldError("consent");
          }}
        />

        {submitState.status === "error" ? (
          <p className={styles.alert} role="alert">
            {submitState.message}{" "}
            <a href={hotlineTel}>{hotlineDisplay}</a>
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting}
          disabled={submitting || !consent}
          className={styles.fullWidth}
        >
          {submitLabel}
        </Button>

        {isTestDrive ? (
          <p className={styles.caption}>{t("submitCaption")}</p>
        ) : null}
      </form>
    </div>
  );
}

export default LeadForm;
