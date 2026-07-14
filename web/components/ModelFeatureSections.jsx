import HtmlContent from "@/components/HtmlContent";
import { pickLocale } from "@/lib/attributes";
import styles from "./ModelFeatureSections.module.css";
/**
 * Alternating image + copy blocks (dealer model detail pattern).
 * @param {{ locale: string, sections: object[], embedded?: boolean }} props
 */
export default function ModelFeatureSections({ locale, sections, embedded = false }) {
  if (!sections.length) return null;

  return (
    <div className={`${styles.list} ${embedded ? styles.listEmbedded : ""}`}>
      {sections.map((section, index) => {
        const imageUrl = section.imageMedia?.publicUrl;
        const reverse = index % 2 === 1;

        return (
          <article
            key={section.id}
            className={`${styles.block} ${reverse ? styles.blockReverse : ""}`}
          >
            <div className={styles.media}>
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={pickLocale(section.imageMedia?.altText, locale) || pickLocale(section.title, locale)}
                  className={styles.image}
                />
              ) : (
                <div className={styles.placeholder} aria-hidden="true" />
              )}
            </div>
            <div className={styles.copy}>
              <h3 className={styles.title}>{pickLocale(section.title, locale)}</h3>
              <HtmlContent html={pickLocale(section.body, locale)} className={styles.body} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
