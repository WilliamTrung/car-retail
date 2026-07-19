import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import styles from "./CtaBand.module.css";

type CtaBandProps = {
  title: string;
  subtitle?: string;
  hotline: { display: string; tel: string };
  zaloUrl: string;
  zaloLabel: string;
};

export function CtaBand({
  title,
  subtitle,
  hotline,
  zaloUrl,
  zaloLabel,
}: CtaBandProps) {
  if (!hotline.tel && !zaloUrl) return null;

  return (
    <section className={styles.root} aria-labelledby="home-cta-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 id="home-cta-title" className={styles.title}>
            {title}
          </h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        <div className={styles.actions}>
          {hotline.tel ? (
            <Button variant="primary" size="lg" href={hotline.tel}>
              <Icon name="phone" size={18} />
              {hotline.display || hotline.tel}
            </Button>
          ) : null}
          {zaloUrl ? (
            <Button
              variant="zalo"
              size="lg"
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="zalo" size={18} />
              {zaloLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
