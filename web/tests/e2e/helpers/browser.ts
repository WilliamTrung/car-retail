import type { Page } from "@playwright/test";

/**
 * React minified hydration/mismatch errors (#418 text mismatch, #423 recoverable
 * hydration error, #425 text content mismatch) plus any explicit "hydrat…" wording.
 * NOTE: unlike `public-ui.spec.ts`, nothing here filters hydration wording out —
 * catching it is the point (T-0057 regression guard).
 */
export const HYDRATION_ERROR_RE = /Minified React error #(418|423|425)|hydrat/i;

/** Console noise that is environmental, not an app defect. */
const IGNORABLE = [
  "Download the React DevTools",
  "favicon.ico",
] as const;

export type ConsoleCapture = {
  /** console.error / console.warning texts + uncaught page errors, in order. */
  messages: string[];
  /** Only the entries matching {@link HYDRATION_ERROR_RE}. */
  hydration: () => string[];
  /** Only uncaught exceptions (`pageerror`). */
  pageErrors: () => string[];
};

/** Attach console + pageerror listeners. Call BEFORE `page.goto`. */
export function captureConsole(page: Page): ConsoleCapture {
  const messages: string[] = [];
  const push = (text: string) => {
    if (IGNORABLE.some((noise) => text.includes(noise))) return;
    messages.push(text);
  };
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      push(`[console.${type}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => push(`[pageerror] ${err.message}`));

  return {
    messages,
    hydration: () => messages.filter((m) => HYDRATION_ERROR_RE.test(m)),
    pageErrors: () => messages.filter((m) => m.startsWith("[pageerror]")),
  };
}

/**
 * Resolve once React has attached fibers — i.e. hydration of `selector`
 * (or of any element in `<body>`) has completed.
 *
 * T-0078: calling `.focus()` / dispatching keys straight after `page.goto()`
 * runs pre-hydration; the element receives focus but React has no listener yet,
 * so `document.activeElement` falls back to BODY and key handlers never fire.
 * Await this first.
 */
export async function waitForHydration(
  page: Page,
  selector?: string,
): Promise<void> {
  await page.waitForFunction(
    (sel: string | null) => {
      const hasFiber = (el: Element) =>
        Object.keys(el).some((k) => k.startsWith("__reactFiber$"));
      if (sel) {
        const el = document.querySelector(sel);
        return Boolean(el && hasFiber(el));
      }
      return Array.from(document.querySelectorAll("body *")).some(hasFiber);
    },
    selector ?? null,
    { timeout: 20_000 },
  );
}

/** Scroll the full page so lazy `next/image` payloads start loading. */
export async function scrollThroughPage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = window.innerHeight;
    const max = document.body.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
}
