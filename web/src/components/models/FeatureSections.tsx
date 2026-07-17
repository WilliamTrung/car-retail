import type { ModelDetailVM } from "@/lib/view-models/model-detail";
import { SmartImage } from "@/components/ui/SmartImage";
import styles from "./FeatureSections.module.css";

type FeatureSectionsProps = {
  sections: ModelDetailVM["featureSections"];
  placeholderCaption?: string;
};

export function FeatureSections({
  sections,
  placeholderCaption,
}: FeatureSectionsProps) {
  if (sections.length === 0) return null;

  return (
    <section className={styles.root}>
      {sections.map((section, i) => (
        <article
          key={`${section.title}-${i}`}
          className={[
            styles.row,
            section.imageLeft ? styles.imageLeft : styles.imageRight,
          ].join(" ")}
        >
          <div className={styles.copy}>
            {section.title ? (
              <h2 className={styles.title}>{section.title}</h2>
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
            placeholderCaption={
              placeholderCaption ??
              (section.title ? `Ảnh ${section.title}` : "Ảnh")
            }
            className={styles.media}
          />
        </article>
      ))}
    </section>
  );
}
