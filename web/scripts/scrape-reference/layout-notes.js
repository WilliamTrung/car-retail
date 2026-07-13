/** Capture layout patterns from a Playwright page. */
export async function captureLayoutNotes(page, site) {
  const data = await page.evaluate(() => {
    const navLinks = [...document.querySelectorAll("nav a, header a")]
      .slice(0, 30)
      .map((a) => ({ text: a.textContent?.trim().slice(0, 40), href: a.href }));

    const cards = [...document.querySelectorAll("[class*='product'], [class*='vehicle'], [class*='model'], .swiper-slide, article")]
      .slice(0, 12)
      .map((el) => ({
        tag: el.tagName,
        className: (el.className || "").toString().slice(0, 80),
        hasImg: !!el.querySelector("img"),
        hasPrice: /\d{1,3}(?:\.\d{3})+\s*₫/.test(el.textContent || ""),
        text: el.textContent?.trim().slice(0, 60),
      }));

    const detailSignals = {
      h1: document.querySelector("h1")?.textContent?.trim().slice(0, 80),
      h2Count: document.querySelectorAll("h2").length,
      imgCount: document.querySelectorAll("img[src*='upload'], img[src*='wp-content']").length,
      hasSpecTable: !!document.querySelector("table"),
      ctaButtons: [...document.querySelectorAll("a, button")]
        .map((el) => el.textContent?.trim())
        .filter((t) => t && /lái thử|test drive|đặt cọc|báo giá|tư vấn/i.test(t))
        .slice(0, 5),
    };

    return { navLinks, cards, detailSignals };
  });

  return {
    site: site.id,
    type: site.type,
    listPage: {
      url: site.baseUrl,
      navModelLinks: data.navLinks.filter((l) => /vf|mpv|limo|van|xe/i.test(`${l.text}${l.href}`)),
      cardPatterns: data.cards.filter((c) => c.hasImg),
      notes: "Home/nav lineup grid with model cards linking to detail pages.",
    },
    detailPage: {
      notes: "Hero image + marketing H2 sections + optional spec/price blocks + test-drive CTA.",
      signals: data.detailSignals,
    },
  };
}

/** @param {import('playwright').Page} page @param {string} path */
export async function screenshotPage(page, path) {
  await page.screenshot({ path, fullPage: false });
}
