import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { pickLocale } from "@/lib/attributes";
import PageSection from "@/components/PageSection";
import { getGlobalFaqs } from "@/lib/queries/public";
import styles from "../page.module.css";

export default async function SupportPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");
  const faqs = await getGlobalFaqs();

  return (
    <PageSection title={t("support")}>
      {faqs.map((faq) => (
        <article key={faq.id} className={styles.faqItem}>
          <h3>{pickLocale(faq.question, locale)}</h3>
          <p>{pickLocale(faq.answer, locale)}</p>
        </article>
      ))}
    </PageSection>
  );
}
