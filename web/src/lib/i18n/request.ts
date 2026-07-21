import { getRequestConfig } from "next-intl/server";
import { hasLocale, IntlError, IntlErrorCode } from "next-intl";
import { routing } from "./routing";

/** Last segment of a fully-qualified message key (e.g. admin.settings.saveButton → saveButton). */
export function getMessageFallback({
  key,
  namespace,
}: {
  key: string;
  namespace?: string;
  error: IntlError;
}): string {
  const qualified = namespace ? `${namespace}.${key}` : key;
  const lastDot = qualified.lastIndexOf(".");
  return lastDot === -1 ? qualified : qualified.slice(lastDot + 1);
}

/** Missing keys are non-fatal; other intl errors still throw. */
export function onError(error: IntlError): void {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    } else {
      console.warn(error);
    }
    return;
  }
  throw error;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
    getMessageFallback,
    onError,
  };
});
