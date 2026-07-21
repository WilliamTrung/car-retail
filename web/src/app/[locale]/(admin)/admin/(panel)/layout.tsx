import type { ReactNode } from "react";
import { Be_Vietnam_Pro } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { logoutAction } from "@/server/auth/actions";
import { requireAdmin } from "@/server/auth/session";
import { AdminNav } from "./_components/AdminNav";
import styles from "./layout.module.css";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import "@/styles/admin.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

type Props = {
  children: ReactNode;
};

/** Admin panel shell — auth-gated, sidebar nav + header + content region. */
export default async function AdminPanelLayout({ children }: Props) {
  const session = await requireAdmin();
  const [locale, messages, t] = await Promise.all([
    getLocale(),
    getMessages(),
    getTranslations("admin.common"),
  ]);

  return (
    <div
      className={[
        "admin-body",
        beVietnamPro.className,
        beVietnamPro.variable,
        styles.shell,
      ].join(" ")}
    >
      <NextIntlClientProvider
        locale={locale}
        messages={{ admin: messages.admin ?? {} }}
      >
        <AdminNav role={session.user.role} />
        <div className={styles.content}>
          <header className={styles.topbar}>
            <p className={styles.user}>
              {session.user.email}
              <span className={styles.role}>{session.user.role}</span>
            </p>
            <form action={logoutAction}>
              <button type="submit">{t("logout")}</button>
            </form>
          </header>
          <main className={styles.main}>{children}</main>
        </div>
      </NextIntlClientProvider>
    </div>
  );
}
