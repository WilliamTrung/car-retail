/** Filter footer/nav/tab noise from scraped dealer copy. */

const NOISE_LINE =
  /^(mô tả|thông số kỹ thuật|đăng ký tư vấn|đăng ký|hỗ trợ khách hàng|thông tin liên hệ|quick links|hotlines|showroom network|tin tức|về chúng tôi|danh mục|sản phẩm|trang chủ|liên hệ|gọi ngay)$/i;

const NOISE_FRAGMENT =
  /THÔNG\s+TIN\s+LIÊN HỆ|HỖ TRỢ KHÁCH HÀNG|SHOWROOM NETWORK|QUICK LINKS|KẾT NỐI VỚI|ĐĂNG KÝ TƯ VẤN/i;

export function cleanParagraph(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isNoiseCopy(text) {
  const t = cleanParagraph(text);
  if (!t) return true;
  if (t.length <= 10 && NOISE_LINE.test(t)) return true;
  if (NOISE_FRAGMENT.test(t)) return true;
  if (/^VinFast\s+[\w\s]+\.\s*(Mô tả|THÔNG)/i.test(t)) return true;
  if (/^Mô tả\.?\s*Mô tả\.?$/i.test(t)) return true;
  if (/^VinFast\s+[\w\s-]+$/i.test(t) && t.length < 40) return true;
  if (/^ưu điểm,?\s*điểm nổi bật/i.test(t)) return true;
  if (/vinfast\s+hồ chí minh|đông sài gòn|bình dương/i.test(t) && t.length < 50) return true;
  if (/để biết thêm thông tin về sản phẩm và giá cả/i.test(t)) return true;
  if (/liên hệ trực tiếp/i.test(t) && t.length < 120) return true;
  return false;
}

/**
 * @param {string[]} paragraphs
 * @param {number} max
 */
export function pickParagraphs(paragraphs, max = 3) {
  return (paragraphs || [])
    .map(cleanParagraph)
    .filter((p) => p.length >= 35 && !isNoiseCopy(p))
    .slice(0, max);
}

/**
 * @param {object[]} sections
 * @param {string} [modelName]
 */
export function normalizeFeatureSections(sections, modelName = "") {
  const seen = new Set();
  const out = [];

  for (const s of sections || []) {
    const title = cleanParagraph(s.title?.vi || s.title);
    let body = cleanParagraph(s.body?.vi || s.body);
    if (!title || isNoiseCopy(title)) continue;
    if (/vinfast\s+hồ chí minh|đông sài gòn|nam thái/i.test(title)) continue;
    if (modelName && title.toLowerCase() === modelName.toLowerCase()) continue;

    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    if (!body || body === title || isNoiseCopy(body) || body.length < 25) {
      if (title.length < 18) continue;
      body = title;
    }

    out.push({
      title: { vi: title, en: cleanParagraph(s.title?.en) || title },
      body: { vi: body, en: cleanParagraph(s.body?.en) || body },
      sortOrder: out.length + 1,
      imageUrl: s.imageUrl || null,
    });
    if (out.length >= 6) break;
  }

  return out;
}

/**
 * @param {object} model
 */
export function buildModelDescription(model) {
  const name = model.name?.vi || model.key;

  const fromParas = pickParagraphs(model.paragraphs);
  if (fromParas.length) {
    const text = fromParas.join(" ");
    return { vi: text, en: text };
  }

  for (const s of model.featureSections || []) {
    const body = cleanParagraph(s.body?.vi);
    if (body.length >= 40 && body !== cleanParagraph(s.title?.vi) && !isNoiseCopy(body)) {
      return { vi: body, en: s.body?.en || body };
    }
  }

  const sentences = (model.featureSections || [])
    .map((s) => cleanParagraph(s.title?.vi))
    .filter((t) => t.length >= 18 && !isNoiseCopy(t));
  if (sentences.length) {
    const unique = [...new Set(sentences)];
    const text = unique.slice(0, 3).join(" ");
    return { vi: text, en: text };
  }

  const bullets = (model.highlights || []).map(cleanParagraph).filter((b) => b && !isNoiseCopy(b));
  if (bullets.length) {
    const text = bullets.slice(0, 3).join(". ") + (bullets.length ? "." : "");
    return { vi: text, en: text };
  }

  const attrs = model.attributes || [];
  const bits = [];
  const range = attrs.find((a) => a.key === "range");
  const seats = attrs.find((a) => a.key === "seats");
  const power = attrs.find((a) => a.key === "power");
  if (range) bits.push(`quãng đường ${range.value} km`);
  if (power) bits.push(`công suất ${power.value} kW`);
  if (seats) bits.push(`${seats.value} chỗ`);
  if (bits.length) {
    const text = `${name} — ${bits.join(", ")}.`;
    return { vi: text, en: text };
  }

  return null;
}

/**
 * @param {object} model
 */
export function buildModelTagline(model) {
  const current = cleanParagraph(model.tagline?.vi);
  const name = cleanParagraph(model.name?.vi);

  if (current && !isNoiseCopy(current) && current !== name && !/^VinFast\s+[\w\s]+$/i.test(current)) {
    return model.tagline;
  }

  const section = (model.featureSections || []).find((s) => {
    const t = cleanParagraph(s.title?.vi);
    return t.length >= 20 && !isNoiseCopy(t) && !t.startsWith("VinFast");
  });
  if (section) {
    const t = cleanParagraph(section.title.vi);
    return { vi: t, en: section.title.en || t };
  }

  const desc = buildModelDescription(model);
  if (desc?.vi) {
    const short = desc.vi.length > 100 ? `${desc.vi.slice(0, 97)}…` : desc.vi;
    return { vi: short, en: short };
  }

  return model.tagline;
}

/**
 * Normalize scraped model marketing copy before seed generation.
 * @param {object} model
 */
export function enrichModel(model) {
  const featureSections = normalizeFeatureSections(model.featureSections, model.name?.vi);
  const description = buildModelDescription({ ...model, featureSections });
  const tagline = buildModelTagline({ ...model, featureSections, description });

  return {
    ...model,
    featureSections,
    description: description || null,
    tagline: tagline || model.tagline || null,
  };
}
