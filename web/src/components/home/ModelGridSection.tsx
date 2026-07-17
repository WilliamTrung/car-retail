import type { ModelCardVM } from "@/lib/view-models/model-card";
import { Button } from "@/components/ui/Button";
import { ModelCard } from "@/components/ui/ModelCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import styles from "./ModelGridSection.module.css";

type Segment = {
  key: "personal" | "commercial";
  title: string;
  models: ModelCardVM[];
};

type ModelGridSectionProps = {
  overline: string;
  title: string;
  segments: Segment[];
  labels: {
    priceFrom: string;
    viewDetails: string;
    testDrive: string;
    eco: string;
    viewAll: string;
  };
  viewAllHref?: string;
};

const MOBILE_PREVIEW = 2;

export function ModelGridSection({
  overline,
  title,
  segments,
  labels,
  viewAllHref = "/",
}: ModelGridSectionProps) {
  const visible = segments.filter((s) => s.models.length > 0);
  if (!visible.length) return null;

  const total = visible.reduce((n, s) => n + s.models.length, 0);

  return (
    <section className={styles.root} aria-labelledby="home-models-title">
      <div className={styles.inner}>
        <SectionTitle
          overline={overline}
          title={title}
          align="center"
          className={styles.heading}
        />
        {/* visually hidden id target — SectionTitle renders h2 without id */}
        <span id="home-models-title" className={styles.srOnly}>
          {title}
        </span>

        {visible.map((segment) => (
          <div key={segment.key} className={styles.segment}>
            <h3 className={styles.segmentTitle}>{segment.title}</h3>
            <ul className={styles.grid}>
              {segment.models.map((model, i) => (
                <li
                  key={model.id}
                  className={styles.card}
                  data-mobile-hide={i >= MOBILE_PREVIEW ? "true" : undefined}
                >
                  <ModelCard
                    model={model}
                    labels={{
                      priceFrom: labels.priceFrom,
                      viewDetails: labels.viewDetails,
                      testDrive: labels.testDrive,
                      eco: labels.eco,
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}

        {total > MOBILE_PREVIEW ? (
          <div className={styles.viewAllWrap}>
            <Button
              variant="outline"
              size="lg"
              href={viewAllHref}
              className={styles.viewAll}
            >
              {labels.viewAll.replace("{count}", String(total))}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
