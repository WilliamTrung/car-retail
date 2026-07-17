"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  AdminInput,
  LocalizedField,
  useAdminForm,
  type LocalizedValue,
} from "@/components/admin";
import { FormField } from "@/components/ui/FormField";
import {
  updateSiteSettingsAction,
  type SiteSettingsDto,
  type SiteSettingsUpdateInput,
} from "./actions";
import styles from "./SettingsForm.module.css";

type FormState = {
  dealerName: LocalizedValue;
  legalEntity: LocalizedValue;
  mst: string;
  email: string;
  copyright: LocalizedValue;
  logoMediaId: string;
  faviconMediaId: string;
  socialLinks: { platform: string; url: string }[];
  privacyPolicyUrl: LocalizedValue;
  consentTemplate: LocalizedValue;
  seoTitle: LocalizedValue;
  seoDescription: LocalizedValue;
  disclaimers: LocalizedValue;
  brandTitle: LocalizedValue;
  brandBody: LocalizedValue;
  tradeTitle: LocalizedValue;
  tradeBody: LocalizedValue;
  tradeCta: LocalizedValue;
  tradeImageMediaId: string;
  promoEnabled: boolean;
  promoEndAt: string;
  promoLabel: LocalizedValue;
  ctaTestDriveLabel: LocalizedValue;
  ctaTestDriveRoute: string;
  ctaDepositLabel: LocalizedValue;
  ctaDepositRoute: string;
  maintenanceMode: boolean;
};

const lv = (
  v: { vi: string; en: string } | null | undefined,
): LocalizedValue => ({ vi: v?.vi ?? "", en: v?.en ?? "" });

const hasLoc = (v: LocalizedValue) => v.vi !== "" || v.en !== "";

/** ISO datetime → `datetime-local` input value (local time, minute precision). */
function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function initForm(s: SiteSettingsDto): FormState {
  return {
    dealerName: lv(s.dealerName),
    legalEntity: lv(s.legalEntity),
    mst: s.mst ?? "",
    email: s.email ?? "",
    copyright: lv(s.copyright),
    logoMediaId: s.logoMediaId ?? "",
    faviconMediaId: s.faviconMediaId ?? "",
    socialLinks: (s.socialLinks ?? []).map((l) => ({
      platform: l.platform,
      url: l.url,
    })),
    privacyPolicyUrl: lv(s.privacyPolicyUrl),
    consentTemplate: lv(s.consentTemplate),
    seoTitle: lv(
      s.seoDefaults && {
        vi: s.seoDefaults.vi.title,
        en: s.seoDefaults.en.title,
      },
    ),
    seoDescription: lv(
      s.seoDefaults && {
        vi: s.seoDefaults.vi.description,
        en: s.seoDefaults.en.description,
      },
    ),
    disclaimers: lv(s.disclaimers),
    brandTitle: lv(
      s.brandStory && { vi: s.brandStory.vi.title, en: s.brandStory.en.title },
    ),
    brandBody: lv(
      s.brandStory && { vi: s.brandStory.vi.body, en: s.brandStory.en.body },
    ),
    tradeTitle: lv(
      s.tradeInBlock && {
        vi: s.tradeInBlock.vi.title,
        en: s.tradeInBlock.en.title,
      },
    ),
    tradeBody: lv(
      s.tradeInBlock && {
        vi: s.tradeInBlock.vi.body,
        en: s.tradeInBlock.en.body,
      },
    ),
    tradeCta: lv(
      s.tradeInBlock && {
        vi: s.tradeInBlock.vi.ctaLabel,
        en: s.tradeInBlock.en.ctaLabel,
      },
    ),
    tradeImageMediaId: s.tradeInBlock?.imageMediaId ?? "",
    promoEnabled: s.promoCountdown?.enabled ?? false,
    promoEndAt: s.promoCountdown?.endAt
      ? isoToLocalInput(s.promoCountdown.endAt)
      : "",
    promoLabel: lv(s.promoCountdown?.label),
    ctaTestDriveLabel: lv(s.ctaTestDrive?.label),
    ctaTestDriveRoute: s.ctaTestDrive?.routeKey ?? "",
    ctaDepositLabel: lv(s.ctaDeposit?.label),
    ctaDepositRoute: s.ctaDeposit?.routeKey ?? "",
    maintenanceMode: s.maintenanceMode,
  };
}

function toPayload(f: FormState): SiteSettingsUpdateInput {
  return {
    dealerName: f.dealerName,
    legalEntity: f.legalEntity,
    mst: f.mst || null,
    email: f.email,
    copyright: hasLoc(f.copyright) ? f.copyright : null,
    logoMediaId: f.logoMediaId || null,
    faviconMediaId: f.faviconMediaId || null,
    socialLinks: f.socialLinks.filter((l) => l.platform || l.url),
    privacyPolicyUrl: hasLoc(f.privacyPolicyUrl) ? f.privacyPolicyUrl : null,
    consentTemplate: hasLoc(f.consentTemplate) ? f.consentTemplate : null,
    seoDefaults:
      hasLoc(f.seoTitle) || hasLoc(f.seoDescription)
        ? {
            vi: { title: f.seoTitle.vi, description: f.seoDescription.vi },
            en: { title: f.seoTitle.en, description: f.seoDescription.en },
          }
        : null,
    disclaimers: hasLoc(f.disclaimers) ? f.disclaimers : null,
    brandStory:
      hasLoc(f.brandTitle) || hasLoc(f.brandBody)
        ? {
            vi: { title: f.brandTitle.vi, body: f.brandBody.vi },
            en: { title: f.brandTitle.en, body: f.brandBody.en },
          }
        : null,
    tradeInBlock:
      hasLoc(f.tradeTitle) || hasLoc(f.tradeBody) || hasLoc(f.tradeCta)
        ? {
            vi: {
              title: f.tradeTitle.vi,
              body: f.tradeBody.vi,
              ctaLabel: f.tradeCta.vi,
            },
            en: {
              title: f.tradeTitle.en,
              body: f.tradeBody.en,
              ctaLabel: f.tradeCta.en,
            },
            ...(f.tradeImageMediaId
              ? { imageMediaId: f.tradeImageMediaId }
              : {}),
          }
        : null,
    promoCountdown:
      f.promoEnabled || f.promoEndAt || hasLoc(f.promoLabel)
        ? {
            enabled: f.promoEnabled,
            endAt: f.promoEndAt ? new Date(f.promoEndAt).toISOString() : "",
            label: f.promoLabel,
          }
        : null,
    ctaTestDrive: f.ctaTestDriveRoute
      ? { label: f.ctaTestDriveLabel, routeKey: f.ctaTestDriveRoute }
      : null,
    ctaDeposit: f.ctaDepositRoute
      ? { label: f.ctaDepositLabel, routeKey: f.ctaDepositRoute }
      : null,
    maintenanceMode: f.maintenanceMode,
  };
}

type Props = { settings: SiteSettingsDto };

/** Site settings singleton form — grouped fieldsets over SiteSettingsUpdateSchema. */
export function SettingsForm({ settings }: Props) {
  const t = useTranslations("admin.settings");
  const tc = useTranslations("admin.common");
  const [form, setForm] = useState<FormState>(() => initForm(settings));
  const { state, submit, pending } = useAdminForm(updateSiteSettingsAction);

  const patch =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) =>
      setForm((f) => ({ ...f, [key]: value }));

  const errors = state.fieldErrors ?? {};
  // ponytail: MediaPicker does not exist yet — plain media-id text inputs;
  // upgrade path: swap AdminInput for MediaPicker when the media ticket lands.

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        submit(toPayload(form));
      }}
    >
      <fieldset className={styles.fieldset}>
        <legend>{t("identityLegend")}</legend>
        <LocalizedField
          id="dealerName"
          label={t("dealerName")}
          required
          value={form.dealerName}
          onChange={patch("dealerName")}
          error={errors.dealerName}
        />
        <LocalizedField
          id="legalEntity"
          label={t("legalEntity")}
          required
          value={form.legalEntity}
          onChange={patch("legalEntity")}
          error={errors.legalEntity}
        />
        <div className={styles.row}>
          <FormField id="mst" label={t("mst")} error={errors.mst}>
            <AdminInput
              id="mst"
              value={form.mst}
              error={errors.mst}
              onChange={(e) => patch("mst")(e.currentTarget.value)}
            />
          </FormField>
          <FormField id="email" label={t("email")} error={errors.email}>
            <AdminInput
              id="email"
              type="email"
              value={form.email}
              error={errors.email}
              onChange={(e) => patch("email")(e.currentTarget.value)}
            />
          </FormField>
        </div>
        <LocalizedField
          id="copyright"
          label={t("copyright")}
          value={form.copyright}
          onChange={patch("copyright")}
          error={errors.copyright}
        />
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>{t("brandingLegend")}</legend>
        <div className={styles.row}>
          <FormField
            id="logoMediaId"
            label={t("logoMediaId")}
            hint={t("mediaIdHint")}
            error={errors.logoMediaId}
          >
            <AdminInput
              id="logoMediaId"
              value={form.logoMediaId}
              error={errors.logoMediaId}
              onChange={(e) => patch("logoMediaId")(e.currentTarget.value)}
            />
          </FormField>
          <FormField
            id="faviconMediaId"
            label={t("faviconMediaId")}
            hint={t("mediaIdHint")}
            error={errors.faviconMediaId}
          >
            <AdminInput
              id="faviconMediaId"
              value={form.faviconMediaId}
              error={errors.faviconMediaId}
              onChange={(e) => patch("faviconMediaId")(e.currentTarget.value)}
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>{t("socialLegend")}</legend>
        {errors.socialLinks ? (
          <p role="alert" className={styles.groupError}>
            {errors.socialLinks}
          </p>
        ) : null}
        {form.socialLinks.map((link, i) => (
          <div key={i} className={styles.socialRow}>
            <FormField id={`social-platform-${i}`} label={t("socialPlatform")}>
              <AdminInput
                id={`social-platform-${i}`}
                value={link.platform}
                onChange={(e) => {
                  const next = [...form.socialLinks];
                  next[i] = { platform: e.currentTarget.value, url: link.url };
                  patch("socialLinks")(next);
                }}
              />
            </FormField>
            <FormField id={`social-url-${i}`} label={t("socialUrl")}>
              <AdminInput
                id={`social-url-${i}`}
                value={link.url}
                onChange={(e) => {
                  const next = [...form.socialLinks];
                  next[i] = {
                    platform: link.platform,
                    url: e.currentTarget.value,
                  };
                  patch("socialLinks")(next);
                }}
              />
            </FormField>
            <button
              type="button"
              className={styles.removeButton}
              onClick={() =>
                patch("socialLinks")(
                  form.socialLinks.filter((_, idx) => idx !== i),
                )
              }
            >
              {t("removeSocialLink")}
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.addButton}
          onClick={() =>
            patch("socialLinks")([
              ...form.socialLinks,
              { platform: "", url: "" },
            ])
          }
        >
          {t("addSocialLink")}
        </button>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>{t("legalLegend")}</legend>
        <LocalizedField
          id="privacyPolicyUrl"
          label={t("privacyPolicyUrl")}
          value={form.privacyPolicyUrl}
          onChange={patch("privacyPolicyUrl")}
          error={errors.privacyPolicyUrl}
        />
        <LocalizedField
          id="consentTemplate"
          label={t("consentTemplate")}
          multiline
          value={form.consentTemplate}
          onChange={patch("consentTemplate")}
          error={errors.consentTemplate}
        />
        <LocalizedField
          id="disclaimers"
          label={t("disclaimers")}
          multiline
          value={form.disclaimers}
          onChange={patch("disclaimers")}
          error={errors.disclaimers}
        />
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>{t("seoLegend")}</legend>
        {errors.seoDefaults ? (
          <p role="alert" className={styles.groupError}>
            {errors.seoDefaults}
          </p>
        ) : null}
        <LocalizedField
          id="seoTitle"
          label={t("seoTitle")}
          value={form.seoTitle}
          onChange={patch("seoTitle")}
        />
        <LocalizedField
          id="seoDescription"
          label={t("seoDescription")}
          multiline
          value={form.seoDescription}
          onChange={patch("seoDescription")}
        />
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>{t("contentLegend")}</legend>
        {errors.brandStory ? (
          <p role="alert" className={styles.groupError}>
            {errors.brandStory}
          </p>
        ) : null}
        <LocalizedField
          id="brandTitle"
          label={t("brandStoryTitle")}
          value={form.brandTitle}
          onChange={patch("brandTitle")}
        />
        <LocalizedField
          id="brandBody"
          label={t("brandStoryBody")}
          multiline
          value={form.brandBody}
          onChange={patch("brandBody")}
        />
        {errors.tradeInBlock ? (
          <p role="alert" className={styles.groupError}>
            {errors.tradeInBlock}
          </p>
        ) : null}
        <LocalizedField
          id="tradeTitle"
          label={t("tradeInTitle")}
          value={form.tradeTitle}
          onChange={patch("tradeTitle")}
        />
        <LocalizedField
          id="tradeBody"
          label={t("tradeInBody")}
          multiline
          value={form.tradeBody}
          onChange={patch("tradeBody")}
        />
        <LocalizedField
          id="tradeCta"
          label={t("tradeInCta")}
          value={form.tradeCta}
          onChange={patch("tradeCta")}
        />
        <FormField
          id="tradeImageMediaId"
          label={t("tradeInImage")}
          hint={t("mediaIdHint")}
        >
          <AdminInput
            id="tradeImageMediaId"
            value={form.tradeImageMediaId}
            onChange={(e) => patch("tradeImageMediaId")(e.currentTarget.value)}
          />
        </FormField>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>{t("promoLegend")}</legend>
        {errors.promoCountdown ? (
          <p role="alert" className={styles.groupError}>
            {errors.promoCountdown}
          </p>
        ) : null}
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={form.promoEnabled}
            onChange={(e) => patch("promoEnabled")(e.currentTarget.checked)}
          />
          {t("promoEnabled")}
        </label>
        <FormField id="promoEndAt" label={t("promoEndAt")}>
          <AdminInput
            id="promoEndAt"
            type="datetime-local"
            value={form.promoEndAt}
            onChange={(e) => patch("promoEndAt")(e.currentTarget.value)}
          />
        </FormField>
        <LocalizedField
          id="promoLabel"
          label={t("promoLabel")}
          value={form.promoLabel}
          onChange={patch("promoLabel")}
        />
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>{t("ctaLegend")}</legend>
        {errors.ctaTestDrive ? (
          <p role="alert" className={styles.groupError}>
            {errors.ctaTestDrive}
          </p>
        ) : null}
        <LocalizedField
          id="ctaTestDriveLabel"
          label={`${t("ctaTestDrive")} — ${t("ctaLabel")}`}
          value={form.ctaTestDriveLabel}
          onChange={patch("ctaTestDriveLabel")}
        />
        <FormField
          id="ctaTestDriveRoute"
          label={`${t("ctaTestDrive")} — ${t("ctaRouteKey")}`}
        >
          <AdminInput
            id="ctaTestDriveRoute"
            value={form.ctaTestDriveRoute}
            onChange={(e) => patch("ctaTestDriveRoute")(e.currentTarget.value)}
          />
        </FormField>
        {errors.ctaDeposit ? (
          <p role="alert" className={styles.groupError}>
            {errors.ctaDeposit}
          </p>
        ) : null}
        <LocalizedField
          id="ctaDepositLabel"
          label={`${t("ctaDeposit")} — ${t("ctaLabel")}`}
          value={form.ctaDepositLabel}
          onChange={patch("ctaDepositLabel")}
        />
        <FormField
          id="ctaDepositRoute"
          label={`${t("ctaDeposit")} — ${t("ctaRouteKey")}`}
        >
          <AdminInput
            id="ctaDepositRoute"
            value={form.ctaDepositRoute}
            onChange={(e) => patch("ctaDepositRoute")(e.currentTarget.value)}
          />
        </FormField>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>{t("systemLegend")}</legend>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={form.maintenanceMode}
            onChange={(e) => patch("maintenanceMode")(e.currentTarget.checked)}
          />
          {t("maintenanceMode")}
        </label>
      </fieldset>

      <div className={styles.footer}>
        <button type="submit" className={styles.saveButton} disabled={pending}>
          {tc("save")}
        </button>
        {state.status === "success" ? (
          <p role="status" className={styles.success}>
            {tc("saved")}
          </p>
        ) : null}
        {state.status === "error" ? (
          <p role="alert" className={styles.error}>
            {state.message ?? tc("error")}
          </p>
        ) : null}
      </div>
    </form>
  );
}
