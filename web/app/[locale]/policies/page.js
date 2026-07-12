import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { pickLocale } from "@/lib/attributes";
import PageSection from "@/components/PageSection";
import sectionStyles from "@/components/PageSection.module.css";
import { getPolicies } from "@/lib/queries/public";
import styles from "../page.module.css";

export default async function PoliciesPage({ params }) {
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
