import { Link } from "@/lib/i18n/navigation";
import { pickLocale } from "@/lib/attributes";
import styles from "./NewsCard.module.css";

/**
 * @param {{ locale: string, post: object, ctaLabel: string }} props
 */
export default function NewsCard({ locale, post, ctaLabel }) {
  const slug = pickLocale(post.slug, locale);
  const title = pickLocale(post.title, locale);
  const excerpt = pickLocale(post.excerpt, locale);
  const imageUrl = post.featuredMedia?.publicUrl;
  const alt = post.featuredMedia?.altText
    ? pickLocale(post.featuredMedia.altText, locale)
    : title;

  return (
    <article className={styles.card}>
      <div className={styles.mediaWrap}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={alt} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.placeholder} aria-hidden="true" />
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link href={{ pathname: "/news/[slug]", params: { slug } }}>{title}</Link>
        </h3>
        {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}
        <Link href={{ pathname: "/news/[slug]", params: { slug } }} className={styles.link}>
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
