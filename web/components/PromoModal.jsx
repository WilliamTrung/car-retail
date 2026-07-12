"use client";

import { useEffect, useState } from "react";
import { pickLocale } from "@/lib/attributes";
import styles from "./PromoModal.module.css";

/**
 * @param {{
 *   locale: string,
 *   models: { id: string, name: { vi: string, en: string } }[],
 *   badge?: string,
 * }} props
 */
export default function PromoModal({ locale, models, badge }) {
  const badgeText = badge || (locale === "vi" ? "ƯU ĐÃI ĐẶC BIỆT" : "SPECIAL OFFER");
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [modelId, setModelId] = useState("");
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    // Show only once per browser session
    const hasSeenPopup = sessionStorage.getItem("hasSeenPromoPopup");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Trigger after 3 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  function handleClose() {
    setIsOpen(false);
    sessionStorage.setItem("hasSeenPromoPopup", "true");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CONSULT",
          locale,
          modelId: modelId || null,
          variantId: null,
          showroomId: null,
          payload: {
            name,
            phone,
            message: "Đăng ký nhận báo giá từ popup khuyến mãi hàng tháng.",
            consent: true,
          },
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch {
      setStatus("error");
    }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        {/* Close Button */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close promotion dialog"
        >
          &times;
        </button>

        {/* Modal Content Split Layout */}
        <div className={styles.split}>
          {/* Left Decorative branding panel */}
          <div className={styles.brandPanel}>
            <div className={styles.brandBadge}>
              {badgeText}
            </div>
            <h3 className={styles.brandTitle}>
              {locale === "vi" ? "NHẬN BÁO GIÁ LĂN BÁNH" : "GET DETAILED PRICE QUOTE"}
            </h3>
            <p className={styles.brandDesc}>
              {locale === "vi"
                ? "Để lại thông tin để nhận báo giá chi tiết, đặc quyền quà tặng phụ kiện chính hãng & voucher thu cũ đổi mới."
                : "Receive customized installment calculations, accessories package details, and trade-in support."}
            </p>
          </div>

          {/* Right Input Form */}
          <div className={styles.formPanel}>
            {status === "success" ? (
              <div className={styles.success}>
                <h4>🎉 {locale === "vi" ? "Đăng ký thành công!" : "Registered successfully!"}</h4>
                <p>
                  {locale === "vi"
                    ? "Chúng tôi sẽ liên hệ báo giá ngay lập tức."
                    : "Our sales advisors will contact you shortly."}
                </p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                  <label htmlFor="promo-name">
                    {locale === "vi" ? "Họ và tên *" : "Full Name *"}
                  </label>
                  <input
                    id="promo-name"
                    required
                    value={name}
                    placeholder={locale === "vi" ? "Ví dụ: Nguyễn Văn A" : "e.g. John Doe"}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="promo-phone">
                    {locale === "vi" ? "Số điện thoại *" : "Phone Number *"}
                  </label>
                  <input
                    id="promo-phone"
                    required
                    type="tel"
                    value={phone}
                    placeholder={locale === "vi" ? "Ví dụ: 0987xxxxxx" : "e.g. 0987xxxxxx"}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="promo-model">
                    {locale === "vi" ? "Dòng xe quan tâm" : "Car Model"}
                  </label>
                  <select
                    id="promo-model"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                  >
                    <option value="">
                      {locale === "vi" ? "— Chọn mẫu xe —" : "— Select vehicle model —"}
                    </option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {pickLocale(m.name, locale)}
                      </option>
                    ))}
                  </select>
                </div>

                {status === "error" && (
                  <p className={styles.error}>
                    {locale === "vi" ? "Gửi thất bại, thử lại." : "Submission failed, try again."}
                  </p>
                )}

                <button
                  type="submit"
                  className={styles.submit}
                  disabled={status === "submitting"}
                >
                  {status === "submitting"
                    ? (locale === "vi" ? "ĐANG GỬI..." : "SUBMITTING...")
                    : (locale === "vi" ? "NHẬN BÁO GIÁ NGAY" : "GET PRICE QUOTE NOW")}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
