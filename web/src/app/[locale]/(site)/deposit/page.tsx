import { getTranslations, setRequestLocale } from "next-intl/server";
import { LeadForm, LeadLandingLayout } from "@/components/leads";
import type { Locale } from "@/lib/view-models/common";
import { resolveLocalized } from "@/lib/view-models/common";
import {
  formatHotlineDisplay,
  toTelHref,
} from "@/lib/view-models/mappers";
import {
  getHotlines,
  getPublishedModels,
  getShowrooms,
} from "@/lib/queries/public";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    model?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return "";
}

export default async function DepositPage({ params, searchParams }: Props) {
  const { locale: localeRaw } = await params;
  const locale = (localeRaw === "en" ? "en" : "vi") as Locale;
  setRequestLocale(localeRaw);

  const t = await getTranslations("forms");
  const tc = await getTranslations("common");
  const sp = await searchParams;
  const modelParam = firstParam(sp.model);

  const [modelsRaw, showroomsRaw, hotlines] = await Promise.all([
    getPublishedModels(),
    getShowrooms(),
    getHotlines(),
  ]);

  const models = modelsRaw.map((m) => ({
    id: m.id,
    name: resolveLocalized(m.name, locale),
    slug: resolveLocalized(m.slug, locale),
  }));

  const showrooms = showroomsRaw.map((s) => ({
    id: s.id,
    name: resolveLocalized(s.name, locale),
    hours: resolveLocalized(s.hours, locale),
  }));

  let defaultModelId = "";
  if (modelParam) {
    const byId = models.find((m) => m.id === modelParam);
    const bySlug = models.find((m) => m.slug === modelParam);
    defaultModelId = byId?.id ?? bySlug?.id ?? "";
  }

  const primaryHotline = [...hotlines].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  )[0]?.phone;
  const hotlineDisplay = primaryHotline
    ? formatHotlineDisplay(primaryHotline)
    : "1900 23 45 67";
  const hotlineTel = primaryHotline
    ? toTelHref(primaryHotline)
    : "tel:1900234567";

  const showroomNames = showrooms.map((s) => s.name).filter(Boolean);
  const hoursNote =
    showrooms.find((s) => s.hours)?.hours || t("depositPage.showroomHoursFallback");
  const showroomNote =
    showroomNames.length > 0
      ? t("depositPage.showroomNote", {
          places: showroomNames.slice(0, 3).join(" - "),
          hours: hoursNote,
        })
      : t("depositPage.showroomEmpty");

  const steps = [1, 2, 3].map((n) => ({
    title: t(`depositPage.step${n}Title`),
    text: t(`depositPage.step${n}Text`),
  }));

  const whyItems = [1, 2, 3, 4].map((n) => t(`depositPage.why${n}`));

  return (
    <LeadLandingLayout
      homeLabel={tc("home")}
      crumbLabel={t("depositPage.crumb")}
      title={t("depositPage.title")}
      subtitle={t("depositPage.subtitle")}
      stepsTitle={t("depositPage.stepsTitle")}
      steps={steps}
      whyTitle={t("depositPage.whyTitle")}
      whyItems={whyItems}
      showroomTitle={t("showroom")}
      showroomNote={showroomNote}
    >
      <LeadForm
        preset="deposit"
        locale={locale}
        models={models.map(({ id, name }) => ({ id, name }))}
        defaultModelId={defaultModelId}
        hotlineDisplay={hotlineDisplay}
        hotlineTel={hotlineTel}
      />
    </LeadLandingLayout>
  );
}
