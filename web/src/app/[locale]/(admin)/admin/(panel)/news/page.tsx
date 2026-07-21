import { requireAdmin } from "@/server/auth/session";
import { contentService } from "@/server/modules/content";
import { mediaService } from "@/server/modules/media";
import { NewsManager } from "./NewsManager";

export default async function AdminNewsPage() {
  await requireAdmin("news");
  const [posts, media] = await Promise.all([
    contentService.listNewsAdmin(),
    mediaService.listMedia(),
  ]);
  const mediaUrls = Object.fromEntries(media.map((a) => [a.id, a.publicUrl]));

  return <NewsManager posts={posts} mediaUrls={mediaUrls} />;
}
