import { getTranslations, setRequestLocale } from "next-intl/server";
import PageSection from "@/components/PageSection";
import { pickLocale } from "@/lib/attributes";
import { getGlobalFaqs } from "@/lib/queries/public";
import styles from "../page.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SupportPage({ params }: Props) {
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
