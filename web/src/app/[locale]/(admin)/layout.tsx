import type { ReactNode } from "react";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/lib/i18n/routing";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Admin segment shell — owns `<html>` / `<body>`; panel chrome lives under `(panel)`. */
export default async function AdminLocaleLayout({ children, params }: Props) {
  const { locale: localeParam } = await params;
  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }
  setRequestLocale(localeParam);

  return (
    <html lang={localeParam}>
      <body>{children}</body>
    </html>
  );
}
