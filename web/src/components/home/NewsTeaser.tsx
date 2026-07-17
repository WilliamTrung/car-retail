import type { NewsTeaserVM } from "@/lib/view-models/home";
import { Button } from "@/components/ui/Button";
import { NewsCard } from "@/components/ui/NewsCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import styles from "./NewsTeaser.module.css";

type NewsTeaserProps = {
  overline: string;
  title: string;
  items: NewsTeaserVM[];
  viewDetailsLabel: string;
  moreLabel?: string;
  moreHref?: string;
};

export function NewsTeaser({
  overline,
  title,
  items,
  viewDetailsLabel,
  moreLabel,
  moreHref = "/news",
}: NewsTeaserProps) {
  if (!items.length) return null;

  return (
    <section className={styles.root} aria-labelledby="home-news-title">
      <div className={styles.inner}>
        <SectionTitle overline={overline} title={title} align="center" />
        <span id="home-news-title" className={styles.srOnly}>
          {title}
        </span>
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.id}>
              <NewsCard item={item} viewDetailsLabel={viewDetailsLabel} />
            </li>
          ))}
        </ul>
        {moreLabel ? (
          <p className={styles.more}>
            <Button variant="ghost" href={moreHref}>
              {moreLabel}
            </Button>
          </p>
        ) : null}
      </div>
    </section>
  );
}
