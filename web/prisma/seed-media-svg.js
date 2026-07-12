/** @param {string} str */
export function hashHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}

/** @param {string} bodyType @param {string} label @param {number} hue */
export function vehicleSvg(bodyType, label, hue) {
  const accent = `hsl(${hue} 62% 46%)`;
  const accentLight = `hsl(${hue} 55% 88%)`;
  const silhouettes = {
    suv: `<path d="M120 280h760l60-80 40-100h-180l-50-40H290l-50 40H120v180z" fill="${accent}"/><circle cx="280" cy="280" r="52" fill="#1a1d26"/><circle cx="720" cy="280" r="52" fill="#1a1d26"/>`,
    mpv: `<path d="M100 285h800l35-95h-150l-45-35H320l-45 35H100v95z" fill="${accent}"/><circle cx="260" cy="285" r="50" fill="#1a1d26"/><circle cx="740" cy="285" r="50" fill="#1a1d26"/>`,
    van: `<path d="M90 285h820l25-90h-520l-35-30H220l-35 30H90v90z" fill="${accent}"/><circle cx="250" cy="285" r="50" fill="#1a1d26"/><circle cx="750" cy="285" r="50" fill="#1a1d26"/>`,
    compact: `<path d="M140 285h720l45-85h-140l-40-35H330l-40 35H140v85z" fill="${accent}"/><circle cx="290" cy="285" r="48" fill="#1a1d26"/><circle cx="710" cy="285" r="48" fill="#1a1d26"/>`,
  };
  const body = silhouettes[bodyType] ?? silhouettes.compact;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accentLight}"/>
      <stop offset="100%" stop-color="#f8f9fb"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="400" fill="url(#bg)"/>
  ${body}
  <text x="500" y="360" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="600" fill="#1a1d26">${label}</text>
</svg>`;
}

/** @param {string} label @param {number} hue */
export function heroSvg(label, hue) {
  const accent = `hsl(${hue} 62% 42%)`;
  const accentDark = `hsl(${hue} 62% 28%)`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 640" role="img">
  <defs>
    <linearGradient id="heroBg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accentDark}"/>
      <stop offset="55%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="#0b5fff"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="640" fill="url(#heroBg)"/>
  <path d="M900 420h520l40-100 30-80h-200l-50-45H980l-50 45H900v180z" fill="rgba(255,255,255,0.18)"/>
  <circle cx="1020" cy="420" r="58" fill="rgba(255,255,255,0.12)"/>
  <circle cx="1320" cy="420" r="58" fill="rgba(255,255,255,0.12)"/>
  <text x="120" y="300" font-family="system-ui,sans-serif" font-size="56" font-weight="700" fill="#fff">${label}</text>
</svg>`;
}

/** @param {string} label @param {number} hue */
export function newsSvg(label, hue) {
  const accent = `hsl(${hue} 55% 90%)`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" role="img">
  <rect width="800" height="450" fill="${accent}"/>
  <rect x="48" y="48" width="704" height="354" rx="12" fill="#fff" opacity="0.55"/>
  <text x="400" y="240" text-anchor="middle" font-family="system-ui,sans-serif" font-size="26" font-weight="600" fill="#1a1d26">${label.slice(0, 42)}</text>
</svg>`;
}

/** @param {{ kind: string, bodyType?: string, label: string, hueSeed: string }} svg */
export function renderSeedSvg(svg) {
  const hue = hashHue(svg.hueSeed);
  if (svg.kind === "vehicle") return vehicleSvg(svg.bodyType ?? "compact", svg.label, hue);
  if (svg.kind === "hero") return heroSvg(svg.label.slice(0, 40), hue);
  if (svg.kind === "news") return newsSvg(svg.label, hue);
  throw new Error(`Unknown seed SVG kind: ${svg.kind}`);
}
