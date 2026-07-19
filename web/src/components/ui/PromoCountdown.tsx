import type { PromoTiming } from "@/lib/view-models/home";
import { CountdownTimer } from "./CountdownTimer";
import { DateBadge } from "./DateBadge";

type PromoCountdownProps = {
  timing: PromoTiming;
  labels?: {
    days?: string;
    hours?: string;
    minutes?: string;
    seconds?: string;
    heading?: string;
  };
  className?: string;
};

/**
 * Live ticking timer when `timing.mode === "live"`; otherwise a static DateBadge
 * (no interval / no CountdownTimer mount).
 */
export function PromoCountdown({
  timing,
  labels,
  className,
}: PromoCountdownProps) {
  if (timing.mode === "live") {
    return (
      <CountdownTimer
        endsAt={timing.endsAt}
        labels={labels}
        className={className}
      />
    );
  }
  return <DateBadge label={timing.validUntilLabel} className={className} />;
}
