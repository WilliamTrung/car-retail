/**
 * Canonical seed media manifest — stable IDs and R2 keys.
 * publicUrl values are filled by npm run db:seed:media (see seed-media-urls.js).
 */

function bi(vi, en) {
  return { vi, en };
}

/** @type {Array<{ id: string, r2Key: string, publicUrl: string, folder: string, altText: { vi: string, en: string }, svg: { kind: string, bodyType?: string, label: string, hueSeed: string }, link: { table: string, entityId: string, field: string } }>} */
export const SEED_MEDIA_ASSETS = [
  {
    id: "seed-media-model-city-ev",
    r2Key: "vehicles/city-ev-compact.svg",
    publicUrl: "https://pub-8f401798955245bdb2d56ae79de9647a.r2.dev/vehicles/city-ev-compact.svg",
    folder: "VEHICLES",
    altText: bi("Ảnh City EV Compact", "City EV Compact image"),
    svg: { kind: "vehicle", bodyType: "compact", label: "City EV Compact", hueSeed: "seed-model-city-ev" },
    link: { table: "vehicleModel", entityId: "seed-model-city-ev", field: "heroMediaId" },
  },
  {
    id: "seed-media-model-family-suv",
    r2Key: "vehicles/family-suv-electric.svg",
    publicUrl: "https://pub-8f401798955245bdb2d56ae79de9647a.r2.dev/vehicles/family-suv-electric.svg",
    folder: "VEHICLES",
    altText: bi("Ảnh Family SUV Electric", "Family SUV Electric image"),
    svg: { kind: "vehicle", bodyType: "suv", label: "Family SUV Electric", hueSeed: "seed-model-family-suv" },
    link: { table: "vehicleModel", entityId: "seed-model-family-suv", field: "heroMediaId" },
  },
  {
    id: "seed-media-model-urban-mpv",
    r2Key: "vehicles/urban-mpv-plus.svg",
    publicUrl: "https://pub-8f401798955245bdb2d56ae79de9647a.r2.dev/vehicles/urban-mpv-plus.svg",
    folder: "VEHICLES",
    altText: bi("Ảnh Urban MPV Plus", "Urban MPV Plus image"),
    svg: { kind: "vehicle", bodyType: "mpv", label: "Urban MPV Plus", hueSeed: "seed-model-urban-mpv" },
    link: { table: "vehicleModel", entityId: "seed-model-urban-mpv", field: "heroMediaId" },
  },
  {
    id: "seed-media-model-cargo-van",
    r2Key: "vehicles/cargo-van-e.svg",
    publicUrl: "https://pub-8f401798955245bdb2d56ae79de9647a.r2.dev/vehicles/cargo-van-e.svg",
    folder: "VEHICLES",
    altText: bi("Ảnh Cargo Van E", "Cargo Van E image"),
    svg: { kind: "vehicle", bodyType: "van", label: "Cargo Van E", hueSeed: "seed-model-cargo-van" },
    link: { table: "vehicleModel", entityId: "seed-model-cargo-van", field: "heroMediaId" },
  },
  {
    id: "seed-media-hero-1",
    r2Key: "heroes/seed-hero-1.svg",
    publicUrl: "https://pub-8f401798955245bdb2d56ae79de9647a.r2.dev/heroes/seed-hero-1.svg",
    folder: "HEROES",
    altText: bi("Banner Khám phá xe điện mới", "Discover new electric vehicles banner"),
    svg: { kind: "hero", label: "Khám phá xe điện mới", hueSeed: "seed-hero-1" },
    link: { table: "heroSlide", entityId: "seed-hero-1", field: "imageMediaId" },
  },
  {
    id: "seed-media-news-1",
    r2Key: "news/ra-mat-xe-dien-moi.svg",
    publicUrl: "https://pub-8f401798955245bdb2d56ae79de9647a.r2.dev/news/ra-mat-xe-dien-moi.svg",
    folder: "NEWS",
    altText: bi("Ảnh bài viết Ra mắt dòng xe điện mới", "New electric lineup launch featured image"),
    svg: { kind: "news", label: "Ra mắt dòng xe điện mới", hueSeed: "seed-news-1" },
    link: { table: "newsPost", entityId: "seed-news-1", field: "featuredMediaId" },
  },
];
