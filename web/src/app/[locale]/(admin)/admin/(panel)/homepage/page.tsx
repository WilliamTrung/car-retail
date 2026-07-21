import { requireAdmin } from "@/server/auth/session";
import { homepageService } from "@/server/modules/homepage";
import { HomepageManager } from "./HomepageManager";

export default async function AdminHomepagePage() {
  await requireAdmin("homepage");
  const [heroSlides, serviceBlocks, deliveryPhotos] = await Promise.all([
    homepageService.listHeroSlidesAdmin(),
    homepageService.listServiceBlocksAdmin(),
    homepageService.listDeliveryPhotosAdmin(),
  ]);

  return (
    <HomepageManager
      heroSlides={heroSlides}
      serviceBlocks={serviceBlocks}
      deliveryPhotos={deliveryPhotos}
    />
  );
}
