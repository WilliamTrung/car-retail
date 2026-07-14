"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { pickLocale } from "@/lib/attributes";
import { formatCardPrice } from "@/lib/format";
import styles from "./VehicleCard.module.css";

const CARD_SPEC_KEYS = ["torque", "range", "seats", "power", "battery"];

/**
 * @param {string} key
 * @param {unknown} value
 * @param {string} locale
 */
function formatCardSpecLine(key, value, locale) {
  const vi = locale === "vi";
  const labels = {
    torque: vi ? "Mô men xoắn cực đại" : "Max torque",
    range: vi ? "Quãng đường đi" : "Range",
    seats: vi ? "Số ghế" : "Seats",
    power: vi ? "Công suất" : "Power",
    battery: vi ? "Pin" : "Battery",
  };
  const suffix = {
    torque: "Nm",
    range: "km",
    seats: vi ? " ghế" : " seats",
    power: "kW",
    battery: "kWh",
  };
  const label = labels[key] || key;
  const unit = suffix[key] || "";
  if (key === "seats") {
    return `${label}: ${value}${unit}.`;
  }
  return `${label}: ${value}${unit}.`;
}

/**
 * @param {{ locale: string, model: object }} props
 */
export default function VehicleCard({ locale, model }) {
  const t = useTranslations("spec");
  const name = pickLocale(model.name, locale);
  const slug = pickLocale(model.slug, locale);
  const imageUrl = model.heroMedia?.publicUrl;
  const alt = model.heroMedia?.altText
    ? pickLocale(model.heroMedia.altText, locale)
    : name;

  const prices = model.variants.map((v) => v.price).filter(Boolean);
  const minPrice = prices.length ? prices.reduce((a, b) => (Number(a) < Number(b) ? a : b)) : null;

  let attributes = [];
  try {
    attributes =
      typeof model.attributes === "string"
        ? JSON.parse(model.attributes)
        : (model.attributes ?? []);
  } catch {
    attributes = [];
  }

  const specLines = CARD_SPEC_KEYS.map((key) => attributes.find((a) => a.key === key))
    .filter(Boolean)
    .slice(0, 4)
    .map((item) => {
      try {
        return formatCardSpecLine(item.key, item.value, locale);
      } catch {
        return `${t(item.key)}: ${item.value}.`;
      }
    });

  return (
    <Link
      href={{ pathname: "/models/[slug]", params: { slug } }}
      className={styles.card}
      aria-label={name}
    >
      <div className={styles.imageStage}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={alt} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.placeholder} aria-hidden="true" />
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>

        {minPrice ? (
          <p className={styles.priceLine}>
            <span className={styles.pricePrefix}>
              {locale === "vi" ? "Giá từ:" : "From:"}
            </span>{" "}
            <span className={styles.priceValue}>{formatCardPrice(minPrice, locale)}</span>
          </p>
        ) : null}

        {specLines.length > 0 ? (
          <ul className={styles.bullets}>
            {specLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </Link>
  );
}
