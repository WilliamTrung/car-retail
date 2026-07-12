"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { pickLocale } from "@/lib/attributes";
import styles from "./LeadForm.module.css";

/**
 * @param {{
 *   type: "TEST_DRIVE" | "DEPOSIT",
 *   locale: string,
 *   models: { id: string, name: { vi: string, en: string }, variants: { id: string, name: { vi: string, en: string } }[] }[],
 *   showrooms: { id: string, name: { vi: string, en: string } }[],
 *   defaultModelId?: string,
 * }} props
 */
export default function LeadForm({ type, locale, models, showrooms, defaultModelId = "" }) {
  const t = useTranslations("forms");
  const tc = useTranslations("common");
  const [modelId, setModelId] = useState(defaultModelId);
  const [variantId, setVariantId] = useState("");
  const [showroomId, setShowroomId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("idle");

  const selectedModel = models.find((m) => m.id === modelId);
  const variants = selectedModel?.variants ?? [];

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");

    const payload = { name, phone, email, consent };
    if (type === "TEST_DRIVE") {
      payload.date = date;
      payload.time = time;
    } else {
      payload.message = message;
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          locale,
          modelId: modelId || null,
          variantId: variantId || null,
          showroomId: showroomId || null,
          payload,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>✓</div>
        <h3 className={styles.successHeading}>{locale === "vi" ? "Gửi Yêu Cầu Thành Công!" : "Request Sent!"}</h3>
        <p className={styles.successText}>{tc("success")}</p>
      </div>
    );
  }

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>
          {type === "TEST_DRIVE" ? t("testDriveTitle") : t("depositTitle")}
        </h3>
        <p className={styles.formSubtitle}>
          {type === "TEST_DRIVE" ? t("testDriveSubtitle") : t("depositSubtitle")}
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Row 1: Name & Phone */}
        <label className={`${styles.field} ${styles.halfWidth}`}>
          <span className={styles.label}>{t("name")} *</span>
          <input 
            required 
            value={name} 
            placeholder={locale === "vi" ? "Họ và tên của bạn" : "Your full name"} 
            onChange={(e) => setName(e.target.value)} 
          />
        </label>
        
        <label className={`${styles.field} ${styles.halfWidth}`}>
          <span className={styles.label}>{t("phone")} *</span>
          <input 
            required 
            type="tel" 
            value={phone} 
            placeholder="Ví dụ: 09xxxxxxxx" 
            onChange={(e) => setPhone(e.target.value)} 
          />
        </label>

        {/* Row 2: Email & Model */}
        <label className={`${styles.field} ${styles.halfWidth}`}>
          <span className={styles.label}>{t("email")}</span>
          <input 
            type="email" 
            value={email} 
            placeholder="email@example.com" 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </label>

        <label className={`${styles.field} ${styles.halfWidth}`}>
          <span className={styles.label}>{t("model")} *</span>
          <select required value={modelId} onChange={(e) => { setModelId(e.target.value); setVariantId(""); }}>
            <option value="">{locale === "vi" ? "— Chọn dòng xe —" : "— Select vehicle model —"}</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>{pickLocale(m.name, locale)}</option>
            ))}
          </select>
        </label>

        {/* Conditional Variant & Showroom */}
        {variants.length ? (
          <label className={`${styles.field} ${styles.halfWidth}`}>
            <span className={styles.label}>{t("variant")} *</span>
            <select required value={variantId} onChange={(e) => setVariantId(e.target.value)}>
              <option value="">{locale === "vi" ? "— Chọn phiên bản —" : "— Select variant —"}</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>{pickLocale(v.name, locale)}</option>
              ))}
            </select>
          </label>
        ) : null}

        {showrooms.length ? (
          <label className={`${styles.field} ${variants.length ? styles.halfWidth : styles.fullWidth}`}>
            <span className={styles.label}>{t("showroom")} *</span>
            <select required value={showroomId} onChange={(e) => setShowroomId(e.target.value)}>
              <option value="">{locale === "vi" ? "— Chọn showroom gần nhất —" : "— Select showroom —"}</option>
              {showrooms.map((s) => (
                <option key={s.id} value={s.id}>{pickLocale(s.name, locale)}</option>
              ))}
            </select>
          </label>
        ) : null}

        {/* Conditional Test Drive details / Deposit message */}
        {type === "TEST_DRIVE" ? (
          <>
            <label className={`${styles.field} ${styles.halfWidth}`}>
              <span className={styles.label}>{t("date")}</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className={`${styles.field} ${styles.halfWidth}`}>
              <span className={styles.label}>{t("time")}</span>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
          </>
        ) : (
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span className={styles.label}>{t("message")}</span>
            <textarea 
              rows={3} 
              value={message} 
              placeholder={locale === "vi" ? "Lời nhắn hoặc yêu cầu tư vấn đặc biệt..." : "Special instructions or notes..."} 
              onChange={(e) => setMessage(e.target.value)} 
            />
          </label>
        )}

        {/* Consent Checkbox */}
        <label className={`${styles.consent} ${styles.fullWidth}`}>
          <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span className={styles.consentText}>{t("consent")}</span>
        </label>

        {status === "error" && <p className={`${styles.error} ${styles.fullWidth}`}>{tc("error")}</p>}
        
        <button type="submit" className={`${styles.submit} ${styles.fullWidth}`} disabled={status === "submitting"}>
          {status === "submitting" ? tc("submitting") : tc("submit")}
        </button>
      </form>
    </div>
  );
}
