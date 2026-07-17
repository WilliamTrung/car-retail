import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/server/auth/session";
import { settingsService } from "@/server/modules/settings";
import { showroomsService } from "@/server/modules/showrooms";
import { HotlinesSection } from "./HotlinesSection";
import { MenuItemsSection } from "./MenuItemsSection";

/** Hotlines + menu items CRUD — SUPER_ADMIN only via RBAC module "navigation". */
export default async function AdminNavigationPage() {
  await requireAdmin("navigation");
  const [hotlines, menuItems, showrooms, t] = await Promise.all([
    settingsService.listHotlinesAdmin(),
    settingsService.listMenuItemsAdmin(),
    showroomsService.listShowroomsAdmin(),
    getTranslations("admin.navigation"),
  ]);
  const showroomOptions = showrooms.map((s) => ({
    id: s.id,
    label: s.name.vi,
  }));

  return (
    <>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      <HotlinesSection hotlines={hotlines} showrooms={showroomOptions} />
      <MenuItemsSection menuItems={menuItems} />
    </>
  );
}
