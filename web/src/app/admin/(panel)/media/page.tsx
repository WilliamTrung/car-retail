import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/server/auth/session";
import { mediaService } from "@/server/modules/media";
import { MediaLibrary } from "./MediaLibrary";

export default async function AdminMediaPage() {
  await requireAdmin("media");
  const [assets, t] = await Promise.all([
    mediaService.listMedia(),
    getTranslations("admin.media"),
  ]);

  return (
    <>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      <MediaLibrary initialAssets={assets} />
    </>
  );
}
