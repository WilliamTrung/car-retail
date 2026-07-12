import "@/styles/globals.css";
import styles from "./layout.module.css";

export const metadata = {
  title: "Admin — Car Retail",
};

export default function AdminLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <main className={styles.admin}>{children}</main>
      </body>
    </html>
  );
}
