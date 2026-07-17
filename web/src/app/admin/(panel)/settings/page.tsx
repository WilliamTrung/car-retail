import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/server/auth/session";
import { settingsService } from "@/server/modules/settings";
import { SettingsForm } from "./SettingsForm";

/** Site settings singleton editor — SUPER_ADMIN only via RBAC module "settings". */
export default async function AdminSettingsPage() {
  await requireAdmin("settings");
  const [settings, t] = await Promise.all([
    settingsService.getSiteSettingsAdmin(),
    getTranslations("admin.settings"),
  ]);

  return (
    <>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      {settings ? (
        <SettingsForm settings={settings} />
      ) : (
        <p role="alert">{t("notConfigured")}</p>
      )}
    </>
  );
}
