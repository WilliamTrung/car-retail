import type { ModelDetailVM } from "@/lib/view-models/model-detail";
import { Chip } from "@/components/ui/Chip";
import { SmartImage } from "@/components/ui/SmartImage";
import styles from "./FeatureSections.module.css";

export type FeatureSectionItem = ModelDetailVM["featureSections"][number] & {
  tags?: string[];
};

type FeatureSectionsProps = {
  sections: FeatureSectionItem[];
  sectionLabel?: string;
};

export function FeatureSections({
  sections,
  sectionLabel,
}: FeatureSectionsProps) {
  if (sections.length === 0) return null;

  return (
    <section className={styles.root} aria-labelledby="model-features-heading">
      <h2 id="model-features-heading" className={styles.srOnly}>
        {sectionLabel ?? "Features"}
      </h2>
      {sections.map((section, i) => (
        <article
          key={`${section.title}-${i}`}
          className={[
            styles.row,
            section.imageLeft ? styles.imageLeft : styles.imageRight,
          ].join(" ")}
        >
          <div className={styles.copy}>
            {section.tags && section.tags.length > 0 ? (
              <ul className={styles.tags}>
                {section.tags.map((tag) => (
                  <li key={tag}>
                    <Chip variant="tag">{tag}</Chip>
                  </li>
                ))}
              </ul>
            ) : null}
            {section.title ? (
              <h3 className={styles.title}>{section.title}</h3>
            ) : null}
            {section.body ? (
              <p className={styles.body}>{section.body}</p>
            ) : null}
          </div>
          <SmartImage
            src={section.imageUrl}
            alt={section.title || ""}
            aspectRatio="16 / 10"
            sizes="(max-width: 900px) 100vw, 50vw"
            className={styles.media}
          />
        </article>
      ))}
    </section>
  );
}
