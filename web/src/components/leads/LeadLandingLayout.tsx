import type { ReactNode } from "react";
import { Link } from "@/lib/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { SmartImage } from "@/components/ui/SmartImage";
import styles from "./LeadLandingLayout.module.css";

export type LeadLandingStep = {
  title: string;
  text: string;
};

export type LeadLandingLayoutProps = {
  homeLabel: string;
  crumbLabel: string;
  title: string;
  subtitle: string;
  stepsTitle: string;
  steps: LeadLandingStep[];
  whyTitle: string;
  whyItems: string[];
  showroomTitle: string;
  showroomNote: string;
  showroomImageUrl?: string | null;
  children: ReactNode;
};

export function LeadLandingLayout({
  homeLabel,
  crumbLabel,
  title,
  subtitle,
  stepsTitle,
  steps,
  whyTitle,
  whyItems,
  showroomTitle,
  showroomNote,
  showroomImageUrl = null,
  children,
}: LeadLandingLayoutProps) {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">{homeLabel}</Link>
            <span className={styles.breadcrumbSep} aria-hidden>
              /
            </span>
            <span>{crumbLabel}</span>
          </nav>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.bodyInner}>
          <aside className={styles.aside}>
            <section className={styles.panel} aria-labelledby="lead-steps-title">
              <h2 id="lead-steps-title" className={styles.panelTitle}>
                {stepsTitle}
              </h2>
              <ol className={styles.steps}>
                {steps.map((step, i) => (
                  <li key={step.title} className={styles.step}>
                    <span className={styles.stepNum} aria-hidden>
                      {i + 1}
                    </span>
                    <div>
                      <h3 className={styles.stepTitle}>{step.title}</h3>
                      <p className={styles.stepText}>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className={styles.panel} aria-labelledby="lead-why-title">
              <h2 id="lead-why-title" className={styles.panelTitle}>
                {whyTitle}
              </h2>
              <ul className={styles.whyList}>
                {whyItems.map((item) => (
                  <li key={item} className={styles.whyItem}>
                    <span className={styles.whyCheck} aria-hidden>
                      <Icon name="check" size={14} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section
              className={styles.panel}
              aria-labelledby="lead-showroom-title"
            >
              <h2 id="lead-showroom-title" className={styles.panelTitle}>
                {showroomTitle}
              </h2>
              <SmartImage
                src={showroomImageUrl}
                alt={showroomTitle}
                aspectRatio="16 / 9"
                sizes="(max-width: 900px) 100vw, 40vw"
                placeholderCaption={showroomTitle}
                className={styles.showroomMedia}
              />
              <p className={styles.showroomNote}>{showroomNote}</p>
            </section>
          </aside>

          <div className={styles.formCol}>{children}</div>
        </div>
      </div>
    </main>
  );
}
