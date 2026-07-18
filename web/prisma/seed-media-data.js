/** Generic catalog media manifest — local raster files under prisma/seed-assets/ */
function bi(vi, en) {
  return { vi, en: en || vi };
}

/**
 * @param {object} opts
 * @param {string} opts.id
 * @param {string} opts.r2Key
 * @param {string} opts.folder
 * @param {{ vi: string, en: string }} opts.altText
 * @param {string} [opts.localFile] — path relative to prisma/
 * @param {object} [opts.svg] — last-resort SVG fallback only
 * @param {{ table: string, entityId: string, field: string }} [opts.link]
 * @param {string} [opts.publicUrl]
 */
function asset({ id, r2Key, folder, altText, localFile, svg, link, publicUrl = "" }) {
  return {
    id,
    r2Key,
    publicUrl,
    folder,
    altText,
    ...(localFile ? { localFile } : {}),
    ...(svg ? { svg } : {}),
    ...(link ? { link } : {}),
  };
}

export const SEED_MEDIA_ASSETS = [
  // ── Model heroes / gallery (IDs match prisma/seed.ts gallery + heroMediaId) ──
  asset({
    id: "seed-media-city-ev-g1",
    r2Key: "models/city-ev/hero.webp",
    localFile: "seed-assets/models/city-ev/hero.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh City EV Compact", "City EV Compact image"),
    svg: { kind: "vehicle", bodyType: "compact", label: "City EV Compact", hueSeed: "seed-media-city-ev-g1" },
    link: { table: "vehicleModel", entityId: "seed-model-city-ev", field: "heroMediaId" },
  }),
  asset({
    id: "seed-media-city-ev-g2",
    r2Key: "models/city-ev/gallery-2.webp",
    localFile: "seed-assets/models/city-ev/gallery-2.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh gallery City EV góc 2", "City EV gallery photo angle 2"),
    svg: { kind: "vehicle", bodyType: "compact", label: "City EV · 2", hueSeed: "seed-media-city-ev-g2" },
  }),
  asset({
    id: "seed-media-city-ev-g3",
    r2Key: "models/city-ev/gallery-3.webp",
    localFile: "seed-assets/models/city-ev/gallery-3.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh gallery City EV góc 3", "City EV gallery photo angle 3"),
    svg: { kind: "vehicle", bodyType: "compact", label: "City EV · 3", hueSeed: "seed-media-city-ev-g3" },
  }),
  asset({
    id: "seed-media-city-ev-g4",
    r2Key: "models/city-ev/gallery-4.webp",
    localFile: "seed-assets/models/city-ev/gallery-4.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh gallery City EV góc 4", "City EV gallery photo angle 4"),
    svg: { kind: "vehicle", bodyType: "compact", label: "City EV · 4", hueSeed: "seed-media-city-ev-g4" },
  }),
  asset({
    id: "seed-media-city-ev-g5",
    r2Key: "models/city-ev/gallery-5.webp",
    localFile: "seed-assets/models/city-ev/gallery-5.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh gallery City EV góc 5", "City EV gallery photo angle 5"),
    svg: { kind: "vehicle", bodyType: "compact", label: "City EV · 5", hueSeed: "seed-media-city-ev-g5" },
  }),

  asset({
    id: "seed-media-family-suv-g1",
    r2Key: "models/family-suv/hero.webp",
    localFile: "seed-assets/models/family-suv/hero.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh Family SUV Electric", "Family SUV Electric image"),
    svg: { kind: "vehicle", bodyType: "suv", label: "Family SUV Electric", hueSeed: "seed-media-family-suv-g1" },
    link: { table: "vehicleModel", entityId: "seed-model-family-suv", field: "heroMediaId" },
  }),
  asset({
    id: "seed-media-family-suv-g2",
    r2Key: "models/family-suv/gallery-2.webp",
    localFile: "seed-assets/models/family-suv/gallery-2.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh gallery Family SUV", "Family SUV gallery photo"),
    svg: { kind: "vehicle", bodyType: "suv", label: "Family SUV · 2", hueSeed: "seed-media-family-suv-g2" },
  }),

  asset({
    id: "seed-media-urban-mpv-g1",
    r2Key: "models/urban-mpv/hero.webp",
    localFile: "seed-assets/models/urban-mpv/hero.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh Urban MPV Plus", "Urban MPV Plus image"),
    svg: { kind: "vehicle", bodyType: "mpv", label: "Urban MPV Plus", hueSeed: "seed-media-urban-mpv-g1" },
    link: { table: "vehicleModel", entityId: "seed-model-urban-mpv", field: "heroMediaId" },
  }),
  asset({
    id: "seed-media-urban-mpv-g2",
    r2Key: "models/urban-mpv/gallery-2.webp",
    localFile: "seed-assets/models/urban-mpv/gallery-2.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh gallery Urban MPV", "Urban MPV gallery photo"),
    svg: { kind: "vehicle", bodyType: "mpv", label: "Urban MPV · 2", hueSeed: "seed-media-urban-mpv-g2" },
  }),

  asset({
    id: "seed-media-cargo-van-g1",
    r2Key: "models/cargo-van/hero.webp",
    localFile: "seed-assets/models/cargo-van/hero.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh Cargo Van E", "Cargo Van E image"),
    svg: { kind: "vehicle", bodyType: "van", label: "Cargo Van E", hueSeed: "seed-media-cargo-van-g1" },
    link: { table: "vehicleModel", entityId: "seed-model-cargo-van", field: "heroMediaId" },
  }),
  asset({
    id: "seed-media-cargo-van-g2",
    r2Key: "models/cargo-van/gallery-2.webp",
    localFile: "seed-assets/models/cargo-van/gallery-2.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh gallery Cargo Van", "Cargo Van gallery photo"),
    svg: { kind: "vehicle", bodyType: "van", label: "Cargo Van · 2", hueSeed: "seed-media-cargo-van-g2" },
  }),

  asset({
    id: "seed-media-metro-g1",
    r2Key: "models/metro/hero.webp",
    localFile: "seed-assets/models/metro/hero.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh Metro EV", "Metro EV image"),
    svg: { kind: "vehicle", bodyType: "compact", label: "Metro EV", hueSeed: "seed-media-metro-g1" },
    link: { table: "vehicleModel", entityId: "seed-model-metro", field: "heroMediaId" },
  }),
  asset({
    id: "seed-media-metro-g2",
    r2Key: "models/metro/gallery-2.webp",
    localFile: "seed-assets/models/metro/gallery-2.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh gallery Metro EV", "Metro EV gallery photo"),
    svg: { kind: "vehicle", bodyType: "compact", label: "Metro EV · 2", hueSeed: "seed-media-metro-g2" },
  }),

  asset({
    id: "seed-media-limo-g1",
    r2Key: "models/limo/hero.webp",
    localFile: "seed-assets/models/limo/hero.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh Limo Green", "Limo Green image"),
    svg: { kind: "vehicle", bodyType: "mpv", label: "Limo Green", hueSeed: "seed-media-limo-g1" },
    link: { table: "vehicleModel", entityId: "seed-model-limo", field: "heroMediaId" },
  }),
  asset({
    id: "seed-media-limo-g2",
    r2Key: "models/limo/gallery-2.webp",
    localFile: "seed-assets/models/limo/gallery-2.webp",
    folder: "VEHICLES",
    altText: bi("Ảnh gallery Limo", "Limo gallery photo"),
    svg: { kind: "vehicle", bodyType: "mpv", label: "Limo · 2", hueSeed: "seed-media-limo-g2" },
  }),

  // ── Homepage hero (seed-hero-1 only in seed.ts) ──
  asset({
    id: "seed-media-hero-1",
    r2Key: "heroes/seed-hero-1.webp",
    localFile: "seed-assets/heroes/seed-hero-1.webp",
    folder: "HEROES",
    altText: bi("Ảnh banner trang chủ", "Homepage hero banner"),
    svg: { kind: "hero", label: "Discover electric", hueSeed: "seed-media-hero-1" },
    link: { table: "heroSlide", entityId: "seed-hero-1", field: "imageMediaId" },
  }),

  // ── News featured images ──
  asset({
    id: "seed-media-news-1",
    r2Key: "news/news-1.webp",
    localFile: "seed-assets/news/news-1.webp",
    folder: "NEWS",
    altText: bi("Ra mắt dòng xe điện mới", "New electric lineup launch"),
    svg: { kind: "news", label: "New electric lineup", hueSeed: "seed-media-news-1" },
    link: { table: "newsPost", entityId: "seed-news-1", field: "featuredMediaId" },
  }),
  asset({
    id: "seed-media-news-2",
    r2Key: "news/news-2.webp",
    localFile: "seed-assets/news/news-2.webp",
    folder: "NEWS",
    altText: bi("Ưu đãi mùa hè 2026", "Summer offer 2026"),
    svg: { kind: "news", label: "Summer offer 2026", hueSeed: "seed-media-news-2" },
    link: { table: "newsPost", entityId: "seed-news-2", field: "featuredMediaId" },
  }),
  asset({
    id: "seed-media-news-3",
    r2Key: "news/news-3.webp",
    localFile: "seed-assets/news/news-3.webp",
    folder: "NEWS",
    altText: bi("Bàn giao xe dịch vụ cho đối tác", "Fleet delivery milestone"),
    svg: { kind: "news", label: "Fleet delivery", hueSeed: "seed-media-news-3" },
    link: { table: "newsPost", entityId: "seed-news-3", field: "featuredMediaId" },
  }),

  // ── Delivery gallery (linked via DELIVERY_PHOTO_MEDIA_LINKS in seed-media-run.js) ──
  asset({
    id: "seed-media-delivery-1",
    r2Key: "delivery/delivery-1.webp",
    localFile: "seed-assets/delivery/delivery-1.webp",
    folder: "SITE",
    altText: bi("Ảnh bàn giao City EV", "City EV delivery photo"),
    svg: { kind: "vehicle", bodyType: "compact", label: "Delivery · City EV", hueSeed: "seed-media-delivery-1" },
  }),
  asset({
    id: "seed-media-delivery-2",
    r2Key: "delivery/delivery-2.webp",
    localFile: "seed-assets/delivery/delivery-2.webp",
    folder: "SITE",
    altText: bi("Ảnh bàn giao Family SUV", "Family SUV delivery photo"),
    svg: { kind: "vehicle", bodyType: "suv", label: "Delivery · Family SUV", hueSeed: "seed-media-delivery-2" },
  }),
  asset({
    id: "seed-media-delivery-3",
    r2Key: "delivery/delivery-3.webp",
    localFile: "seed-assets/delivery/delivery-3.webp",
    folder: "SITE",
    altText: bi("Ảnh bàn giao Urban MPV", "Urban MPV delivery photo"),
    svg: { kind: "vehicle", bodyType: "mpv", label: "Delivery · Urban MPV", hueSeed: "seed-media-delivery-3" },
  }),
  asset({
    id: "seed-media-delivery-4",
    r2Key: "delivery/delivery-4.webp",
    localFile: "seed-assets/delivery/delivery-4.webp",
    folder: "SITE",
    altText: bi("Ảnh bàn giao Family SUV", "Family SUV delivery photo"),
    svg: { kind: "vehicle", bodyType: "suv", label: "Delivery · Family SUV", hueSeed: "seed-media-delivery-4" },
  }),
  asset({
    id: "seed-media-delivery-5",
    r2Key: "delivery/delivery-5.webp",
    localFile: "seed-assets/delivery/delivery-5.webp",
    folder: "SITE",
    altText: bi("Ảnh bàn giao Cargo Van", "Cargo Van delivery photo"),
    svg: { kind: "vehicle", bodyType: "van", label: "Delivery · Cargo Van", hueSeed: "seed-media-delivery-5" },
  }),
];

export const SEED_MEDIA_FALLBACKS = {};
