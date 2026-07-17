import type { ModelCardVM } from "@/lib/view-models/model-card";
import { ModelCard } from "@/components/ui/ModelCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import styles from "./RelatedModels.module.css";

type RelatedModelsProps = {
  models: ModelCardVM[];
  title: string;
  labels?: {
    priceFrom?: string;
    viewDetails?: string;
    testDrive?: string;
    eco?: string;
  };
};

export function RelatedModels({ models, title, labels }: RelatedModelsProps) {
  if (models.length === 0) return null;

  return (
    <section className={styles.root} aria-label={title}>
      <div className={styles.inner}>
        <SectionTitle title={title} align="left" />
        <ul className={styles.grid}>
          {models.map((model) => (
            <li key={model.id}>
              <ModelCard model={model} labels={labels} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
