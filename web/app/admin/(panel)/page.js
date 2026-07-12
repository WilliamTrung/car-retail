import Link from "next/link";
import { canAccess } from "@/lib/admin/roles";
import { getSession } from "@/lib/admin/session";
import prisma from "@/lib/prisma";
import styles from "./panel.module.css";

export default async function AdminDashboard() {
  const session = await getSession();
  const [leadCount, modelCount, newsCount] = await Promise.all([
    canAccess(session?.role, "leads")
      ? prisma.lead.count({ where: { status: "NEW" } })
      : Promise.resolve(null),
    canAccess(session?.role, "models")
      ? prisma.vehicleModel.count({ where: { published: true } })
      : Promise.resolve(null),
    canAccess(session?.role, "news")
      ? prisma.newsPost.count({ where: { published: true } })
      : Promise.resolve(null),
  ]);

  return (
    <>
      <h1>Dashboard</h1>
      <div className={styles.grid2}>
        {leadCount !== null ? (
          <div className={styles.card}>
            <h2>New leads</h2>
            <p style={{ fontSize: "2rem", margin: 0 }}>{leadCount}</p>
            <Link href="/admin/leads">Open inbox →</Link>
          </div>
        ) : null}
        {modelCount !== null ? (
          <div className={styles.card}>
            <h2>Published models</h2>
            <p style={{ fontSize: "2rem", margin: 0 }}>{modelCount}</p>
            <Link href="/admin/models">Manage vehicles →</Link>
          </div>
        ) : null}
        {newsCount !== null ? (
          <div className={styles.card}>
            <h2>Published news</h2>
            <p style={{ fontSize: "2rem", margin: 0 }}>{newsCount}</p>
            <Link href="/admin/news">Manage news →</Link>
          </div>
        ) : null}
      </div>
      <p className={styles.muted}>
        Public site:{" "}
        <a href="/vi" target="_blank" rel="noreferrer">
          /vi
        </a>
      </p>
    </>
  );
}
