"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/view-models/common";
import type { ModelDetailVM, VariantVM } from "@/lib/view-models/model-detail";
import type { PromoTiming } from "@/lib/view-models/home";
import { Button } from "@/components/ui/Button";
import { EcoChip } from "@/components/ui/Chip";
import { PriceText } from "@/components/ui/PriceText";
import { PromoCountdown } from "@/components/ui/PromoCountdown";
import { VariantCard } from "@/components/ui/VariantCard";
import styles from "./VariantSelector.module.css";

type CtaLabels = {
  testDrive: string;
  deposit: string;
  call: string;
  zalo: string;
  contactPrice: string;
  priceFrom: string;
  variantsLabel: string;
  promoLabel?: string;
  eco?: string;
  ratingAria?: string;
  ratingValue?: string;
};

type VariantSelectorProps = {
  model: Pick<
    ModelDetailVM,
    "id" | "name" | "taglineOverline" | "isEv" | "variants" | "promo" | "priceFromVnd"
  >;
  locale: Locale;
  paths: {
    testDrive: string;
    deposit: string;
    call: string | null;
    zalo: string;
  };
  labels: CtaLabels;
};

function withQuery(base: string, params: Record<string, string>) {
  const url = new URL(base, "http://local.invalid");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return `${url.pathname}${url.search}`;
}

/** Model-detail promo is always far-out — never mount a live timer. */
function staticPromoTiming(dateRange: string | null | undefined): PromoTiming {
  return {
    mode: "static",
    validUntilLabel: dateRange?.trim() || "",
  };
}

export function VariantSelector({
  model,
  locale,
  paths,
  labels,
}: VariantSelectorProps) {
  const defaultVariant =
    model.variants.find((v) => v.isDefault) ?? model.variants[0]!;
  const [selectedId, setSelectedId] = useState(defaultVariant.id);

  const selected: VariantVM =
    model.variants.find((v) => v.id === selectedId) ?? defaultVariant;

  const price = selected.priceVnd ?? model.priceFromVnd;

  const hrefs = useMemo(() => {
    const q = { model: model.id, variant: selected.id };
    return {
      testDrive: selected.allowsTestDrive
        ? withQuery(paths.testDrive, q)
        : withQuery(paths.testDrive, { model: model.id }),
      deposit: selected.allowsDeposit
        ? withQuery(paths.deposit, q)
        : withQuery(paths.deposit, { model: model.id }),
    };
  }, [model.id, paths.deposit, paths.testDrive, selected]);

  const promoTiming = staticPromoTiming(model.promo?.dateRange);
  const showPromo = Boolean(model.promo && model.promo.bullets.length > 0);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        {model.isEv ? (
          <EcoChip>{labels.eco ?? "⚡ 100% Điện"}</EcoChip>
        ) : null}
        {model.taglineOverline ? (
          <p className={styles.overline}>{model.taglineOverline}</p>
        ) : null}
        <h1 className={styles.title}>{model.name}</h1>
        {labels.ratingAria ? (
          <p className={styles.rating} aria-label={labels.ratingAria}>
            <span className={styles.stars} aria-hidden="true">
              ★★★★★
            </span>
            {labels.ratingValue ? (
              <span className={styles.ratingValue}>{labels.ratingValue}</span>
            ) : null}
          </p>
        ) : null}
        <p className={styles.priceRow}>
          <span className={styles.from}>{labels.priceFrom}</span>
          <PriceText
            amount={price}
            size="lg"
            locale={locale}
            contactLabel={labels.contactPrice}
          />
        </p>
      </div>

      {showPromo && model.promo ? (
        <aside
          className={styles.promo}
          aria-label={labels.promoLabel ?? "Promo"}
        >
          {promoTiming.mode === "static" && promoTiming.validUntilLabel ? (
            <PromoCountdown
              timing={promoTiming}
              className={styles.promoBadge}
            />
          ) : null}
          <ul className={styles.promoList}>
            {model.promo.bullets.slice(0, 3).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </aside>
      ) : null}

      <div
        className={styles.variants}
        role="radiogroup"
        aria-label={labels.variantsLabel}
      >
        {model.variants.map((variant) => (
          <VariantCard
            key={variant.id}
            variant={variant}
            name="model-variant"
            selected={variant.id === selected.id}
            onSelect={() => setSelectedId(variant.id)}
            locale={locale}
            contactLabel={labels.contactPrice}
          />
        ))}
      </div>

      <div className={styles.ctas}>
        <Button
          variant="primary"
          size="lg"
          href={hrefs.deposit}
          className={styles.cta}
        >
          {labels.deposit}
        </Button>
        <Button
          variant="outline"
          size="lg"
          href={hrefs.testDrive}
          className={styles.cta}
        >
          {labels.testDrive}
        </Button>
        {paths.call ? (
          <Button
            variant="secondary"
            size="lg"
            href={paths.call}
            className={styles.cta}
          >
            {labels.call}
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="lg"
            href={hrefs.testDrive}
            className={styles.cta}
          >
            {labels.call}
          </Button>
        )}
        <Button
          variant="zalo"
          size="lg"
          href={paths.zalo}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
        >
          {labels.zalo}
        </Button>
      </div>
    </div>
  );
}
