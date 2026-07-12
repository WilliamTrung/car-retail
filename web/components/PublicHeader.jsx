import { getMenuItems, getSiteSettings, getHotlines, getShowrooms } from "@/lib/queries/public";
import { pickLocale } from "@/lib/attributes";
import Header from "./Header";

/**
 * @param {{ locale: string }} props
 */
export default async function PublicHeader({ locale }) {
  const [settings, headerMenu, hotlines, showrooms] = await Promise.all([
    getSiteSettings(),
    getMenuItems("HEADER"),
    getHotlines(),
    getShowrooms(),
  ]);

  const dealerName = settings ? pickLocale(settings.dealerName, locale) : undefined;
  const logoUrl = settings?.logoMedia?.publicUrl;
  const ctaTestDrive = settings?.ctaTestDrive ?? null;
  const ctaDeposit = settings?.ctaDeposit ?? null;

  const navItems = headerMenu.map((item) => ({
    id: item.id,
    label: pickLocale(item.label, locale),
    href: item.routeKey,
  }));

  const primaryPhone = hotlines[0]?.phone ?? "";
  const email = settings?.email ?? "";
  const primaryShowroom = showrooms[0];
  const primaryShowroomName = primaryShowroom ? pickLocale(primaryShowroom.name, locale) : "";
  const openingHours = primaryShowroom?.hours ? pickLocale(primaryShowroom.hours, locale) : "";

  return (
    <Header
      dealerName={dealerName}
      logoUrl={logoUrl}
      navItems={navItems}
      ctaTestDrive={ctaTestDrive}
      ctaDeposit={ctaDeposit}
      locale={locale}
      primaryPhone={primaryPhone}
      email={email}
      primaryShowroom={primaryShowroomName}
      openingHours={openingHours}
    />
  );
}
