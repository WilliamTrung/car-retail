/** Reference sites for Playwright scrape (dev seed only). */
export const REFERENCE_SITES = [
  {
    id: "vinfastauto",
    label: "VinFast OEM",
    baseUrl: "https://vinfastauto.com/vn_vi",
    type: "oem-spa",
    priority: 1,
  },
  {
    id: "vinfastdongsaigon",
    label: "VinFast Đông Sài Gòn",
    baseUrl: "https://vinfastdongsaigon.vn/",
    type: "wordpress-dealer",
    priority: 2,
  },
  {
    id: "vinfast3sgiatothcm",
    label: "VinFast 3S Giá Tốt HCM",
    baseUrl: "https://vinfast3sgiatothcm.com/",
    type: "wordpress-dealer",
    priority: 3,
  },
  {
    id: "vinfastsaigoncenter",
    label: "VinFast Sài Gòn Center",
    baseUrl: "https://vinfastsaigoncenter.com/",
    type: "wordpress-dealer",
    priority: 4,
  },
  {
    id: "vinfastnamthaibinhduong",
    label: "VinFast Nam Thái Bình Dương",
    baseUrl: "https://vinfastnamthaibinhduong.vn/",
    type: "wordpress-dealer",
    priority: 5,
  },
];

/** Known model name patterns for link discovery. */
export const MODEL_PATTERNS = [
  /vf\s*3/i,
  /vf\s*5/i,
  /vf\s*6/i,
  /vf\s*7/i,
  /vf\s*8/i,
  /vf\s*9/i,
  /vf\s*e34/i,
  /mpv\s*7/i,
  /limo\s*green/i,
  /ec\s*van/i,
  /herio/i,
  /nerio/i,
  /minio/i,
];
