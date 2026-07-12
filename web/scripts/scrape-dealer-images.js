/**
 * One-off helper: print image URLs from dealer homepages.
 * node scripts/scrape-dealer-images.js
 */
const sites = [
  ["vinfastdongsaigon", "https://vinfastdongsaigon.vn/"],
  ["vinfast3sgiatothcm", "https://vinfast3sgiatothcm.com/"],
  ["vinfastsaigoncenter", "https://vinfastsaigoncenter.com/"],
  ["vinfastnamthaibinhduong", "https://vinfastnamthaibinhduong.vn/"],
];

function collectUrls(html, origin) {
  const found = new Set();
  const patterns = [
    /https?:\/\/[^"'\\s>]+\.(?:png|jpe?g|webp|gif)(?:\?[^"'\\s>]*)?/gi,
    /\/wp-content\/uploads\/[^"'\\s>]+\.(?:png|jpe?g|webp|gif)(?:\?[^"'\\s>]*)?/gi,
    /srcset="([^"]+)"/gi,
    /data-src="([^"]+)"/gi,
    /data-lazy-src="([^"]+)"/gi,
  ];

  for (const re of patterns) {
    let m;
    while ((m = re.exec(html)) !== null) {
      const raw = m[1] || m[0];
      for (const part of raw.split(",")) {
        const token = part.trim().split(/\s+/)[0];
        if (!token || token.startsWith("data:")) continue;
        const abs = token.startsWith("http") ? token : new URL(token, origin).href;
        if (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(abs)) found.add(abs.split("?")[0]);
      }
    }
  }
  return [...found];
}

for (const [label, url] of sites) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    const html = await res.text();
    const imgs = collectUrls(html, url);
    console.log(`\n=== ${label} ${url} (${res.status}) — ${imgs.length} ===`);
    for (const u of imgs) console.log(u);
  } catch (err) {
    console.error(`\n=== ${label} ERROR ===`, err.message);
  }
}
