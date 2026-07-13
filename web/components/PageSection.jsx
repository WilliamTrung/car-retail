import styles from "./PageSection.module.css";

/**
 * @param {{
 *   title: string,
 *   children: import("react").ReactNode,
 *   id?: string,
 *   variant?: "default" | "dealer",
 *   eyebrow?: string,
 * }} props
 */
export default function PageSection({ title, children, id, variant = "default", eyebrow }) {
  return (
    <section
      className={`${styles.section} ${variant === "dealer" ? styles.sectionDealer : ""}`}
      id={id}
    >
      <div className={styles.inner}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h2 className={styles.title}>{title}</h2>
        {children}
      </div>
    </section>
  );
}
