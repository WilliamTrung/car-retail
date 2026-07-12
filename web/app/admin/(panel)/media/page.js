import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/roles";
import prisma from "@/lib/prisma";
import MediaUpload from "@/components/admin/MediaUpload";
import { pickLocale } from "@/lib/attributes";
import styles from "../panel.module.css";

export default async function MediaPage() {
  const session = await getSession();
  if (!canAccess(session?.role, "media")) redirect("/admin");

  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <>
      <h1>Media library</h1>
      <MediaUpload />
      <div className={styles.grid2} style={{ marginTop: "var(--space-lg)" }}>
        {assets.map((asset) => (
          <div key={asset.id} className={styles.card}>
            <p className={styles.muted}>{asset.folder}</p>
            <a href={asset.publicUrl} target="_blank" rel="noreferrer">
              {asset.r2Key}
            </a>
            {asset.altText ? (
              <p>{pickLocale(asset.altText, "vi")}</p>
            ) : null}
            <p className={styles.muted} style={{ fontSize: "0.75rem" }}>
              ID: {asset.id}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
