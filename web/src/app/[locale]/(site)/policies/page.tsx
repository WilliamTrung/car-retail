import { getTranslations, setRequestLocale } from "next-intl/server";
import PageSection from "@/components/PageSection";
import sectionStyles from "@/components/PageSection.module.css";
import { pickLocale } from "@/lib/attributes";
import { getPolicies } from "@/lib/queries/public";
import styles from "../page.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PoliciesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");
  const policies = await getPolicies();

  return (
    <PageSection title={t("policies")}>
      {policies.map((policy) => (
        <article key={policy.id} className={styles.featureBlock}>
          <h3>{pickLocale(policy.title, locale)}</h3>
          {policy.body ? (
            <div className={sectionStyles.prose}>
              {pickLocale(policy.body, locale)
                .split("\n")
                .map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
            </div>
          ) : null}
        </article>
      ))}
    </PageSection>
  );
}
