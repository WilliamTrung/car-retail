import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import LeadForm from "@/components/LeadForm";
import sectionStyles from "@/components/PageSection.module.css";
import { getPublishedModels, getShowrooms } from "@/lib/queries/public";

export default async function DepositPage({ params, searchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("forms");
  const { model: defaultModelId } = await searchParams;

  const [models, showrooms] = await Promise.all([
    getPublishedModels(),
    getShowrooms(),
  ]);

  const formModels = models.map((m) => ({
    id: m.id,
    name: m.name,
    variants: m.variants.map((v) => ({ id: v.id, name: v.name })),
  }));

  return (
    <div className={sectionStyles.pageHeader}>
      <h1>{t("depositTitle")}</h1>
      <p>{t("depositSubtitle")}</p>
      <LeadForm
        type="DEPOSIT"
        locale={locale}
        models={formModels}
        showrooms={showrooms}
        defaultModelId={typeof defaultModelId === "string" ? defaultModelId : ""}
      />
    </div>
  );
}
