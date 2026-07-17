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
    showroom?: string | string[];
  }>;
};

const PROVINCE_IDS = [
  "hcm",
  "binh-duong",
  "ha-noi",
  "da-nang",
  "can-tho",
] as const;

function firstParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return "";
}

export default async function TestDrivePage({ params, searchParams }: Props) {
  const { locale: localeRaw } = await params;
  const locale = (localeRaw === "en" ? "en" : "vi") as Locale;
  setRequestLocale(localeRaw);

  const t = await getTranslations("forms");
  const tc = await getTranslations("common");
  const sp = await searchParams;
  const modelParam = firstParam(sp.model);
  const showroomParam = firstParam(sp.showroom);

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
    city: s.city,
    hours: resolveLocalized(s.hours, locale),
  }));

  const provinces = PROVINCE_IDS.map((id) => ({
    id,
    name: t(`provinces.${id}`),
  }));

  let defaultModelId = "";
  if (modelParam) {
    const byId = models.find((m) => m.id === modelParam);
    const bySlug = models.find((m) => m.slug === modelParam);
    defaultModelId = byId?.id ?? bySlug?.id ?? "";
  }

  const defaultShowroomId = showrooms.some((s) => s.id === showroomParam)
    ? showroomParam
    : "";

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
    showrooms.find((s) => s.hours)?.hours || t("page.showroomHoursFallback");
  const showroomNote =
    showroomNames.length > 0
      ? t("page.showroomNote", {
          places: showroomNames.slice(0, 3).join(" - "),
          hours: hoursNote,
        })
      : t("page.showroomEmpty");

  const steps = [1, 2, 3].map((n) => ({
    title: t(`page.step${n}Title`),
    text: t(`page.step${n}Text`),
  }));

  const whyItems = [1, 2, 3, 4].map((n) => t(`page.why${n}`));

  return (
    <LeadLandingLayout
      homeLabel={tc("home")}
      crumbLabel={t("page.crumb")}
      title={t("page.title")}
      subtitle={t("page.subtitle")}
      stepsTitle={t("page.stepsTitle")}
      steps={steps}
      whyTitle={t("page.whyTitle")}
      whyItems={whyItems}
      showroomTitle={t("showroom")}
      showroomNote={showroomNote}
    >
      <LeadForm
        preset="test_drive"
        locale={locale}
        models={models.map(({ id, name }) => ({ id, name }))}
        showrooms={showrooms.map(({ id, name }) => ({ id, name }))}
        provinces={provinces}
        defaultModelId={defaultModelId}
        defaultShowroomId={defaultShowroomId}
        hotlineDisplay={hotlineDisplay}
        hotlineTel={hotlineTel}
      />
    </LeadLandingLayout>
  );
}
