import styles from "./PageSection.module.css";

/**
 * @param {{ title: string, children: import("react").ReactNode, id?: string }} props
 */
export default function PageSection({ title, children, id }) {
  return (
    <section className={styles.section} id={id}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{title}</h2>
        {children}
      </div>
    </section>
  );
}
