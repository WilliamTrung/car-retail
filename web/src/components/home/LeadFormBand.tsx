import type { ReactNode } from "react";
import styles from "./LeadFormBand.module.css";

type LeadFormBandProps = {
  overline: string;
  title: string;
  subtitle?: string;
  hotline?: { display: string; tel: string };
  hotlineHint?: string;
  /** T-0014 owns LeadForm — pass through when available */
  form: ReactNode;
};

export function LeadFormBand({
  overline,
  title,
  subtitle,
  hotline,
  hotlineHint,
  form,
}: LeadFormBandProps) {
  return (
    <section className={styles.root} aria-labelledby="home-lead-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          {overline ? <p className={styles.overline}>{overline}</p> : null}
          <h2 id="home-lead-title" className={styles.title}>
            {title}
          </h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          {hotline?.tel ? (
            <p className={styles.hotline}>
              {hotlineHint ? <span>{hotlineHint} </span> : null}
              <a href={hotline.tel}>{hotline.display || hotline.tel}</a>
            </p>
          ) : null}
        </div>
        <div className={styles.formSlot}>{form}</div>
      </div>
    </section>
  );
}

/**
 * T-0014 placeholder — replaced when `@/components/leads/LeadForm` ships.
 * Keep layout shell identical so LeadForm can drop in without restyling the band.
 */
export function LeadFormStub({ note }: { note: string }) {
  return (
    <div className={styles.stub} data-lead-form-stub="consult">
      {/* T-0014: replace with <LeadForm preset="consult" /> */}
      <p className={styles.stubNote}>{note}</p>
    </div>
  );
}
