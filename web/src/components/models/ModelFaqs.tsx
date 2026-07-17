import type { ModelDetailVM } from "@/lib/view-models/model-detail";
import { FaqItem } from "@/components/ui/FaqItem";
import { SectionTitle } from "@/components/ui/SectionTitle";
import styles from "./ModelFaqs.module.css";

type ModelFaqsProps = {
  faqs: ModelDetailVM["faqs"];
  title: string;
};

export function ModelFaqs({ faqs, title }: ModelFaqsProps) {
  if (faqs.length === 0) return null;

  return (
    <section className={styles.root} aria-label={title}>
      <div className={styles.inner}>
        <SectionTitle title={title} align="left" />
        <div className={styles.list}>
          {faqs.map((faq) => (
            <FaqItem key={faq.q} question={faq.q}>
              {faq.a}
            </FaqItem>
          ))}
        </div>
      </div>
    </section>
  );
}
