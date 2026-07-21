import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/server/auth/session";
import { contentService } from "@/server/modules/content";
import { mediaService } from "@/server/modules/media";
import { ContentTabs } from "./ContentTabs";
import styles from "../cms.module.css";

export default async function AdminPagesPage() {
  await requireAdmin("pages");
  const [pages, policies, faqs, media, t] = await Promise.all([
    contentService.listPagesAdmin(),
    contentService.listPoliciesAdmin(),
    contentService.listFaqsAdmin(),
    mediaService.listMedia(),
    getTranslations("admin.pages"),
  ]);
  const mediaUrls = Object.fromEntries(media.map((a) => [a.id, a.publicUrl]));

  return (
    <section className={styles.page}>
      <div>
        <h1>{t("title")}</h1>
        <p className={styles.muted}>{t("description")}</p>
      </div>
      <ContentTabs
        pages={pages}
        policies={policies}
        faqs={faqs}
        mediaUrls={mediaUrls}
      />
    </section>
  );
}
