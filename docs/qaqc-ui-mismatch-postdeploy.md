# QA/QC Post-Deploy Re-Verification — car-retail live vs Penpot design

- **Date:** 2026-07-18
- **Deploy under test:** commit `47f2d67` (live and settled — build no longer changing)
- **Target:** https://car-retail.williamthanhtrung.id.vn/en (and /vi)
- **Design source of truth:** Penpot PNGs — `car-retail-penpot-design-system.png`, `-home-desktop.png`, `-test-drive.png`, `-model-detail.png`, `-showrooms.png`, `-mobile-home.png`
- **Method:** Playwright MCP, desktop 1440×900 + mobile 390×844. Assertions from `browser_snapshot` (accessibility tree), `browser_console_messages`, `browser_network_requests`, and read-only `browser_evaluate` for computed-style token sampling.
- **Evidence caveat:** screenshots could not be saved to local disk in this MCP sandbox. All evidence below is snapshot text, console log text, network-request status lines, and computed-style values captured inline — no PNG artifacts were produced for this run.
- **Scope exclusion:** brand name (VOLTA vs "Sample Auto Dealer"), language, and marketing copy differences are intentionally EXCLUDED from pass/fail — this review compares structure, layout, design tokens, and components only.
- **Prior baseline:** this is a re-test of the pre-deploy findings recorded 2026-07-18 (graph-memory `qaqc` node `run-car-retail-ui-2026-07-18`: 2 blockers + 12 majors + 2 minors).

## Overall verdict

**15 / 15 tracked fixes confirmed live** on commit `47f2d67`. LangSwitcher (T-0040) fix confirmed working. Two new non-blocking findings surfaced this run (React hydration error #418, and a majority of R2 image fetches rendering as broken/empty boxes rather than the expected placeholder SVG) — both are release-non-blocking and are noted for the owning follow-up tasks.

---

## Home — `/en` and `/vi`

| # | Fix | Result | Evidence |
|---|-----|--------|----------|
| 1 | 7-item header nav (Home/Products/Promotions/Test Drive/Showroom/News/Contact) | **PASS** | Snapshot: nav listitems e9–e23 = Home, Products, Promotions(→/en/news), Test Drive(→/en/book-test-drive), Showroom(→/en/showrooms), News(→/en/news), Contact(→/en/contact). VI equivalent confirmed on news-detail nav: Trang chủ/Sản phẩm/Khuyến mãi/Lái thử/Showroom/Tin tức/Liên hệ. |
| 2 | Showrooms entry in header + footer | **PASS** | Header nav "Showroom" → `/en/showrooms`. Footer "Quick links" list includes "Showrooms" → `/en/showrooms`, plus a full "Showroom network" footer block listing all 3 branches. |
| 3 | 4-card benefit strip, no Trade-in | **PASS** | region "Benefits" → 4 listitems: Monthly offers, Installment up to 90%, Free test drive, 3S service. No Trade-in card present. |
| 4 | Service/commercial 3 cards (Cargo Van E / Metro EV / Limo Green) | **PASS** | heading "Service / commercial" → list of 3 articles: Cargo Van E (529.000.000đ), Metro EV (269.000.000đ), Limo Green (749.000.000đ). |
| 5 | Promo countdown timer renders d/h/m/s | **PASS** | `timer "Ends in:"` renders 4 units labelled Days/Hours/Minutes/Seconds. Verified live-decrementing: read as 166d 09h 29m 03s, then 166d 09h 27m 23s on a reload ~2 min later — confirms it is a real running clock, not static markup. |
| 6 | News teaser 3 cards | **PASS** | region "Updates from Volta Auto" → 3 articles: New electric lineup launch, Summer offer 2026, Fleet delivery milestone, each with date + "View details" link. |
| 7 | Delivery gallery 5 photos | **PASS** | region "Over 1,200 customers have taken delivery" → 5 figure/listitems with distinct captions (City EV Compact–District 7, Family SUV Electric–Central, Urban MPV Plus–Central, Family SUV Electric–District 7, Cargo Van E–District 7). |
| 8 | Footer 3 branches (Thu Duc / District 7 / Binh Duong) | **PASS** | Footer "Showroom network": Volta Auto Thu Duc (3S), Volta Auto District 7 (3S), Volta Auto Binh Duong (2S), each with address + phone. |
| 9 | Inline lead form + consent | **PASS** | region "Get advice within 5 minutes": Full name*, Phone number*, Model of interest (6-option select), consent checkbox linking to `/en/policies`, submit button (correctly `disabled` until required fields + consent are filled — not tested to completion since that would submit real lead data). |

### Mobile home (390×844)

| Check | Result | Evidence |
|---|---|---|
| Stacked layout | **PASS** | Hamburger menu replaces horizontal nav; hero, benefits, model list, promo, delivery gallery, news, lead form, footer all stack vertically in single column. |
| Progressive disclosure ("View all 6 models") | **PASS** | Only 2 model cards render (Urban MPV Plus, City EV Compact) followed by a "View all 6 models" button — matches design's mobile-home frame pattern. |
| Bottom action bar vs `06` design | **PARTIAL / note-only, not a tracked fix** | Live adds a persistent fixed bottom nav with 3 actions (Call / Zalo / Test drive). The mobile-home.png design shows only two floating circular buttons (Zalo + phone) near the hero, no separate bottom tab bar. This is a carry-over minor finding from the pre-deploy run (`defect-mobile-bottom-tabbar-extra`), reconfirmed still present. Not in the 15-fix list, not release-blocking — it's a superset addition (more contact affordance than design specified), not a broken pattern. |

### NEW finding — React error #418 (hydration mismatch), home page

**Severity: minor–medium, non-blocking.**

Reproduced on every fresh load of `/en` (and `/vi`) home page:

```
Error: Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]=
  for the full message ...
  at rD (.../chunks/4bd1b696-f785427dddbba9fb.js:1:35057)
  at rO (.../chunks/4bd1b696-f785427dddbba9fb.js:1:36090)
```

Error #418 is React's "Hydration failed because the initial UI does not match what was rendered on the server" — specifically a text-content mismatch on hydrate. It fires exactly once per fresh navigation to `/en`, consistently reproduced across 3 separate loads in this session (confirmed via `browser_console_messages`).

**Suspected component:** `CountdownTimer` inside the "Summer offer" promo band. The countdown text (days/hours/minutes/seconds) is almost certainly computed from `Date.now()` during the server render pass, then recomputed from a different client timestamp a moment later during hydration — the classic Next.js #418 pattern for any "live clock" component that isn't gated behind a client-only mount check. The countdown functionally still displays and decrements correctly after hydration settles (confirmed by the two countdown readings above), so there is no visible user-facing breakage, but it is a real, reproducible console error surfacing on every home page load, which is worth fixing at the source (defer the timer's first paint to `useEffect`/client-only render, or wrap in `suppressHydrationWarning`).

Model detail, showrooms, test-drive, and news-detail pages all loaded with **0 console errors** in this session — the error is isolated to the home route.

---

## Model detail — `/en/models/city-ev-compact`

| # | Fix | Result | Evidence |
|---|-----|--------|----------|
| 10 | Gallery thumbnail strip that swaps hero | **PASS** | region "Image gallery" → hero img + `listbox "Thumbnails"` with 5 options. Functionally verified: clicked thumbnail 2, `aria-selected="true"` moved to the new thumbnail (`GalleryHero_thumbActive__SwjzX` class applied) — confirms real state-driven swap, not just static markup. |
| 11 | Promo callout box between price and variant selector | **PASS** | DOM order confirmed: `599.000.000đ` price → `complementary "Current offers"` (3 bullets: 10% off, 100% registration fee support, free home charging package) → `radiogroup "Variants & pricing"`. Matches the design's price→promo→selector stacking. |
| 12 | 3-row feature-storytelling section | **PASS** | 3 `article` blocks below the fold, each heading+copy+image: "City-ready turning radius", "Infotainment & voice assistant", "Safety you can feel". |
| 13 | Spec strip | **PASS** | region "Specifications" → definition list: Range 320 km, Power 100 kW, Seats 5 seats. |

Design tokens sampled via `browser_evaluate` (computed styles, read-only):

| Token | Design system value | Live computed value | Match |
|---|---|---|---|
| CTA fill (accent/600-cta) | `#C4370F` | `rgb(196, 55, 15)` = `#C4370F` | ✅ |
| Price text (accent/500) | `#E8481F` | `rgb(232, 72, 31)` = `#E8481F` | ✅ |
| Footer navy | `#0B1F32` | `rgb(11, 31, 50)` = `#0B1F32` | ✅ |
| Button radius | sm 8px | `8px` | ✅ |

No delta found in sampled tokens.

---

## Showrooms — `/en/showrooms`

| # | Fix | Result | Evidence |
|---|-----|--------|----------|
| 14 | 3 branch cards + region filter tabs incl. Binh Duong | **PASS** | `tablist "Filter by city"`: All (3), HCMC (2), Binh Duong (1). 3 `article` cards: Volta Auto Thu Duc (3S), Volta Auto District 7 (3S), Volta Auto Binh Duong (2S), each with address, hours, phone, Directions link, "Book at this branch" link. 0 console errors on this page. |

---

## Test drive — `/en/book-test-drive`

| # | Fix | Result | Evidence |
|---|-----|--------|----------|
| 15a | Form with 3 showroom options | **PASS** | `combobox "Showroom"` options: Volta Auto Thu Duc, Volta Auto District 7, Volta Auto Binh Duong. |
| 15b | Location list 3 | **PASS** | region "Showroom" sidebar text: "Volta Auto Thu Duc - Volta Auto District 7 - Volta Auto Binh Duong — open Mon–Sun: 8:00 AM–8:00 PM". (Rendered as one summary line rather than 3 separate card rows as in the wireframe — acceptable structural equivalent, all 3 branches present.) |

0 console errors on this page.

---

## i18n / LangSwitcher (T-0040) — news detail page

**Result: PASS.**

- Started at `/en/news/new-electric-lineup`. VI switcher link = `/vi/tin-tuc/ra-mat-xe-dien-moi` (a genuinely translated slug, not a literal locale-swap of the English slug).
- Clicked it: navigated to `https://car-retail.williamthanhtrung.id.vn/vi/tin-tuc/ra-mat-xe-dien-moi`, page title `Ra mắt dòng xe điện mới`, full Vietnamese article content rendered, **no 404**.
- On the VI page, the EN switcher correctly links back to `/en/news/new-electric-lineup` (round-trip verified).
- This closes the previously-tracked defect `9de13e6e-fdda-4089-8605-eff16df9d6f6` ("LangSwitcher on news detail pages produces real 404 — per-locale slug mismatch", medium severity, T-0037 partial fix). T-0040 completes the fix by resolving the *other-locale* slug from the NewsPost record instead of passing the current slug straight through.

**Minor incidental note:** immediately before the VI navigation, one console error was observed: a 404 on `/_next/static/chunks/app/%5Blocale%5D/contact/page-843b2323b3fe24e2.js` (a stale prefetch chunk hash). This looks like a transient stale-cache/prefetch artifact unrelated to LangSwitcher — it did not block the news-detail navigation and was not seen again on subsequent page loads in this session. Not logged as a graph-memory defect (single occurrence, not reproduced on demand); flagging here for visibility only.

---

## Image / media reality audit

Per the known deploy state (all 32 external R2 source fetches failed at deploy time → expected generic SVG placeholders), this run sampled actual `<img>` network behavior with `browser_network_requests` + read-only `browser_evaluate` (`img.complete`, `img.naturalWidth`).

| Image | URL pattern | Result |
|---|---|---|
| Home hero/promotion banner | `heroes/seed-hero-1.svg` | **Placeholder SVG loads OK** (200, 300×120 generic gray box) |
| City EV Compact gallery hero (home card + model-detail gallery) | `vehicles/gallery/seed-media-city-ev-g1.svg` | **Broken / empty box** — `net::ERR_BLOCKED_BY_ORB`, `naturalWidth: 0` |
| Delivery gallery ×5 | `vehicles/vf-3/5/6/7/8-hero.svg` | **Broken / empty box** — all 5 fail `net::ERR_BLOCKED_BY_ORB` |
| News teaser ×3 | `news/home.svg`, `news/ban-giao-...svg`, `news/volta-vf-3-...svg` | **Broken / empty box** — all 3 fail `net::ERR_BLOCKED_BY_ORB` |
| Home vehicle cards ×5 (Urban MPV Plus, Family SUV Electric, Cargo Van E, Metro EV, Limo Green) and showroom cards ×3 | n/a — no network request | **Soft text-fallback placeholder** — renders `"Ảnh {name}"` inside the image slot; this is a designed no-image state (no failed fetch, no broken icon), a different and *better* degradation than the ORB-blocked ones. |

### NEW finding — most R2 image fetches are broken boxes, not placeholder SVGs

**Severity: major (media quality), non-blocking for layout/structure — but worse than the assumed baseline.**

Only 1 of 10 sampled `pub-8f401798955245bdb2d56ae79de9647a.r2.dev` image URLs actually renders anything (the home hero, a generic placeholder SVG). The other 9 distinct URLs sampled — the model-detail/city-ev gallery hero, all 5 delivery-gallery photos, and all 3 news teaser photos — fail the network request with `net::ERR_BLOCKED_BY_ORB` and render as a **broken/empty image box** (`naturalWidth: 0`, no decodable image, no visible fallback art), which is worse than "generic SVG placeholder." `ERR_BLOCKED_BY_ORB` (Opaque Response Blocking) typically indicates the response for those specific R2 object keys is missing a correct `Content-Type`/CORS header for cross-origin sub-resource loads, while the one working `heroes/` path is configured correctly. This is distinct from the 5 home vehicle-card images and 3 showroom-card images, which gracefully degrade to a text-label placeholder with no network request at all (a designed, working fallback state).

This is tracked under the umbrella of **T-0055** (real photos pending), but the ORB-blocked-box behavior is a sharper issue than "photos are placeholders" — it should be verified as part of that work (check the R2 bucket's CORS/content-type config for the `vehicles/gallery/`, `vehicles/vf-*-hero.svg`, and `news/*.svg` paths specifically, not just the `heroes/` path that already works).

---

## Summary

**15 / 15 tracked fixes: PASS.**

| Category | Count |
|---|---|
| Home fixes confirmed | 9 / 9 |
| Model-detail fixes confirmed | 4 / 4 |
| Showrooms page fix confirmed | 1 / 1 |
| Test-drive fixes confirmed | 1 / 1 (2 sub-checks) |
| Mobile checks confirmed | 2 / 2 (stacked layout, view-all disclosure) |
| LangSwitcher (T-0040) | PASS |
| New findings this run | 3 (1 reopened-as-note: bottom tab bar persists; 2 new: React #418, ORB-broken images) |

### Design-complete now (structurally matches Penpot, brand/copy excluded)
- Header nav (7 items), Showrooms entry in header + footer
- Home: 4-card benefit strip, 3-card service/commercial grid, live countdown timer, 3-card news teaser, 5-photo delivery gallery, 3-branch footer, inline lead form + consent
- Model detail: gallery thumbnail strip (functional swap verified), promo callout box, 3-row feature storytelling, spec strip
- Showrooms page: 3 branch cards + region filter tabs (incl. Binh Duong)
- Test drive: 3 showroom options in form + 3-location summary
- Mobile home: stacked layout + progressive-disclosure "view all" control
- LangSwitcher: news-detail EN↔VI now resolves to genuinely translated slugs, no 404 (T-0040)
- Design tokens sampled (CTA `#C4370F`, price `#E8481F`, footer navy `#0B1F32`, 8px radius) match the design system exactly

### What remains (explicitly out of scope for this run, tracked elsewhere)
- **Real photography** — currently only 1 of 10 sampled R2 images renders a generic placeholder SVG; the other 9 render as broken/empty boxes (`ERR_BLOCKED_BY_ORB`), which is worse than the expected placeholder state. Tracked by **T-0055**; recommend the R2 CORS/content-type check be folded into that task alongside swapping in real photos.
- **React #418 hydration mismatch on home** — reproduces on every fresh `/en`/`/vi` load, suspected `CountdownTimer` SSR/CSR timestamp mismatch. Non-blocking (countdown still renders/decrements correctly post-hydration) but a real, fixable console error. Not yet assigned to a task in this handoff — flagged here for triage.
- **`seed.js` / data-seeding follow-up** — tracked by **T-0056** (not independently re-verified in this run beyond observing the current seeded showroom/model/news counts, which all matched the 15-fix expectations).
- **Minor, non-blocking, not part of the 15 fixes:** mobile persistent bottom action bar (Call/Zalo/Test drive) is a live addition not present in the `mobile-home.png` design frame — a superset of the design, not a regression; carried over from the pre-deploy run as a reconfirmed-open minor note.

### Brand/copy diffs excluded
Per instructions, all differences attributable to placeholder brand "VOLTA"/"Sample Auto Dealer" naming, Vietnamese-vs-English copy content, and marketing text wording were excluded from this comparison. This report evaluates structure, layout, design tokens, and component composition only.

---

## Persistence

- Graph-memory `qaqc` namespace: new `qa_run` node `run-car-retail-postdeploy-2026-07-18` (linked `follows_up_on` → prior run `run-car-retail-ui-2026-07-18`).
- 12 previously-open `defect` nodes updated to `status: fixed` with verification evidence and linked `verified_fixed` from this run: `defect-header-nav-incomplete`, `defect-showrooms-orphan-page`, `defect-showroom-branch-count`, `defect-home-benefit-strip-count`, `defect-home-countdown-missing`, `defect-home-service-grid-count`, `defect-home-news-teaser-count`, `defect-model-detail-gallery-reduced`, `defect-model-detail-promo-callout-missing`, `defect-model-detail-feature-section-missing`, `defect-mobile-no-view-all-disclosure`, and the LangSwitcher defect (`9de13e6e-...`, T-0040).
- 1 previously-open defect reconfirmed still open (minor, non-blocking): `defect-mobile-bottom-tabbar-extra`.
- 2 new `defect` nodes added (`status: open`): `defect-home-react418-hydration`, `defect-broken-image-orb-blocked`.
- Task ledger: `qaqc-postdeploy-2026-07-18` milestone recorded as `done` under `project_id: car-retail`, `agent_name: qaqc`.
- Per instruction, **no task-db tickets filed** — T-0055 (real photos) and T-0056 (seed.js) already cover the outstanding tails; the React #418 finding is new and not yet ticketed (flagged in this report for triage instead).
