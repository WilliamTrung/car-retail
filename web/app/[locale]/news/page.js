import { getTranslations, setRequestLocale } from "next-intl/server";
import NewsCard from "@/components/NewsCard";
import PageSection from "@/components/PageSection";
import sectionStyles from "@/components/PageSection.module.css";
import { getAllNews } from "@/lib/queries/public";

export default async function NewsListPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");
  const posts = await getAllNews();

  return (
    <PageSection title={t("news")}>
      <div className={`${sectionStyles.grid} ${sectionStyles.gridCols3}`}>
        {posts.map((post) => (
          <NewsCard key={post.id} locale={locale} post={post} ctaLabel={t("viewDetails")} />
        ))}
      </div>
    </PageSection>
  );
}
