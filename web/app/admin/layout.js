import "@/styles/globals.css";
import "@/styles/admin.css";

export const metadata = {
  title: "Admin — Car Retail",
};

export default function AdminLayout({ children }) {
  return (
    <html lang="vi">
      <body className="admin-body" style={{ margin: 0, padding: 0, background: "var(--color-bg)" }}>
        {children}
      </body>
    </html>
  );
}
