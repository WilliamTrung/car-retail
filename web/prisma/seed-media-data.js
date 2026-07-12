/**
 * Seed media manifest — stable IDs, R2 keys, dealer source URLs (committed in git).
 * Mapped to seed models in prisma/seed.js by entityId.
 *
 * sourceUrl: reference photo on dealer / OEM sites (dev/demo seeding only).
 * publicUrl: filled after npm run db:seed:media → also writes seed-media-urls.js.
 *
 * Model mapping:
 *   city-ev-compact    → VF 3 (compact)
 *   family-suv-electric → VF 8 (SUV)
 *   urban-mpv-plus     → MPV 7
 *   cargo-van-e        → EC Van
 */

function bi(vi, en) {
  return { vi, en };
}

/** @type {Array<{ id: string, r2Key: string, sourceUrl: string, sourceSite: string, publicUrl: string, folder: string, altText: { vi: string, en: string }, link: { table: string, entityId: string, field: string } }>} */
export const SEED_MEDIA_ASSETS = [
  {
    id: "seed-media-model-city-ev",
    r2Key: "vehicles/city-ev-compact.png",
    sourceUrl: "https://vinfastdongsaigon.vn/wp-content/uploads/2022/11/vf3-thumb_1715586838.png",
    sourceSite: "vinfastdongsaigon.vn",
    publicUrl: "https://pub-8f401798955245bdb2d56ae79de9647a.r2.dev/vehicles/city-ev-compact.png",
    folder: "VEHICLES",
    altText: bi("Ảnh City EV Compact", "City EV Compact image"),
    link: { table: "vehicleModel", entityId: "seed-model-city-ev", field: "heroMediaId" },
  },
  {
    id: "seed-media-model-family-suv",
    r2Key: "vehicles/family-suv-electric.png",
    sourceUrl: "https://vinfastdongsaigon.vn/wp-content/uploads/2022/11/VF8.png",
    sourceSite: "vinfastdongsaigon.vn",
    publicUrl: "https://pub-8f401798955245bdb2d56ae79de9647a.r2.dev/vehicles/family-suv-electric.png",
    folder: "VEHICLES",
    altText: bi("Ảnh Family SUV Electric", "Family SUV Electric image"),
    link: { table: "vehicleModel", entityId: "seed-model-family-suv", field: "heroMediaId" },
  },
  {
    id: "seed-media-model-urban-mpv",
    r2Key: "vehicles/urban-mpv-plus.png",
    sourceUrl:
      "https://vinfastnamthaibinhduong.vn/wp-content/uploads/2026/04/mpv-7-21-3-26-dai-dien-trang-chu.png",
    sourceSite: "vinfastnamthaibinhduong.vn",
    publicUrl: "https://pub-8f401798955245bdb2d56ae79de9647a.r2.dev/vehicles/urban-mpv-plus.png",
    folder: "VEHICLES",
    altText: bi("Ảnh Urban MPV Plus", "Urban MPV Plus image"),
    link: { table: "vehicleModel", entityId: "seed-model-urban-mpv", field: "heroMediaId" },
  },
  {
    id: "seed-media-model-cargo-van",
    r2Key: "vehicles/cargo-van-e.png",
    sourceUrl: "https://vinfastdongsaigon.vn/wp-content/uploads/2025/05/ecvan-02-1.png",
    sourceSite: "vinfastdongsaigon.vn",
    publicUrl: "https://pub-8f401798955245bdb2d56ae79de9647a.r2.dev/vehicles/cargo-van-e.png",
    folder: "VEHICLES",
    altText: bi("Ảnh Cargo Van E", "Cargo Van E image"),
    link: { table: "vehicleModel", entityId: "seed-model-cargo-van", field: "heroMediaId" },
  },
  {
    id: "seed-media-hero-1",
    r2Key: "heroes/seed-hero-1.png",
    sourceUrl:
      "https://vinfastdongsaigon.vn/wp-content/uploads/2026/06/vinfast-vf3-uu-dai-he-vinpearl-desktop-scaled.png",
    sourceSite: "vinfastdongsaigon.vn",
    publicUrl: "https://pub-8f401798955245bdb2d56ae79de9647a.r2.dev/heroes/seed-hero-1.png",
    folder: "HEROES",
    altText: bi("Banner Khám phá xe điện mới", "Discover new electric vehicles banner"),
    link: { table: "heroSlide", entityId: "seed-hero-1", field: "imageMediaId" },
  },
  {
    id: "seed-media-news-1",
    r2Key: "news/ra-mat-xe-dien-moi.jpg",
    sourceUrl:
      "https://vinfast3sgiatothcm.com/wp-content/uploads/2026/04/Khuyen-mai-VinFast-moi-nhat-1024x576.jpg",
    sourceSite: "vinfast3sgiatothcm.com",
    publicUrl: "https://pub-8f401798955245bdb2d56ae79de9647a.r2.dev/news/ra-mat-xe-dien-moi.jpg",
    folder: "NEWS",
    altText: bi("Ảnh bài viết Ra mắt dòng xe điện mới", "New electric lineup launch featured image"),
    link: { table: "newsPost", entityId: "seed-news-1", field: "featuredMediaId" },
  },
];

/**
 * Alternate sources per asset (fallback if primary sourceUrl fails).
 * Keys match SEED_MEDIA_ASSETS id.
 */
export const SEED_MEDIA_FALLBACKS = {
  "seed-media-model-city-ev": [
    "https://vinfastnamthaibinhduong.vn/wp-content/uploads/2025/12/gen-o-z7367150516019_0bfbf5a8cd45b2ae5003c55c83653423-1.jpg",
  ],
  "seed-media-model-urban-mpv": [
    "https://vinfastdongsaigon.vn/wp-content/uploads/2022/11/vf-mpv-7_hover.png",
    "https://vinfastdongsaigon.vn/wp-content/uploads/2024/05/vf5-7.png",
  ],
  "seed-media-hero-1": [
    "https://vinfastdongsaigon.vn/wp-content/uploads/2025/03/banner-20250326_0.png",
    "https://vinfastnamthaibinhduong.vn/wp-content/uploads/2026/05/dai-ly-vinfastbinhduong-17-4-26.jpg",
  ],
  "seed-media-news-1": [
    "https://vinfastsaigoncenter.com/wp-content/uploads/2026/05/anh-giao-xe-vinfast-thu-duc-22-5-26-1.jpg",
    "https://vinfastdongsaigon.vn/wp-content/uploads/2024/06/MAT-TIEN.jpg",
  ],
};
