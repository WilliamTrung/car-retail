import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import styles from "./ShowroomCtaBand.module.css";

type Props = {
  title: string;
  subtitle: string;
  hotlineDisplay: string;
  hotlineTel: string;
  callLabel: string;
};

export function ShowroomCtaBand({
  title,
  subtitle,
  hotlineDisplay,
  hotlineTel,
  callLabel,
}: Props) {
  if (!hotlineTel && !hotlineDisplay) return null;

  return (
    <section className={styles.band} aria-label={title}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.sub}>{subtitle}</p>
        </div>
        {hotlineTel ? (
          <Button
            variant="primary"
            size="lg"
            href={hotlineTel}
            aria-label={callLabel}
          >
            <Icon name="phone" size={20} />
            {hotlineDisplay || callLabel}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
