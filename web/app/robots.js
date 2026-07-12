import { getSiteUrl } from "@/lib/seo";

export default function robots() {
  const base = getSiteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
