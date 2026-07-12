/** @param {string} url */
export function extFromUrl(url) {
  const match = url.match(/\.(\w+)(?:\?|$)/i);
  return match ? match[1].toLowerCase() : "jpg";
}

/** @param {string} url */
export async function fetchSeedImage(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "car-retail-seed/1.0 (+dealer reference import)",
      Accept: "image/*,*/*",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || `image/${extFromUrl(url)}`;
  const ext = extFromUrl(url);
  return { buffer, contentType, ext };
}
