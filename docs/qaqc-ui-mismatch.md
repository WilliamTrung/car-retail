# UI Mismatch Review — Live Car-Retail Site vs Penpot Design

Run date: 2026-07-18
Live base URL: https://car-retail.williamthanhtrung.id.vn/en
Design source: C:\Users\LEGION\.claude\agents\assets\ui-designer\car-retail-penpot-*.png

**Scope note:** brand name ("Sample Auto Dealer" vs "VOLTA AUTO"), model names, and English vs Vietnamese copy are expected/placeholder differences and are **excluded** from this review. Only structure, layout, design tokens, and components are compared.

**Tooling note:** live screenshots were captured and visually inspected during this session via the Playwright MCP browser tool, but that tool's screenshot storage is sandboxed to its own container temp path and is not reachable from the host-filesystem tools (Bash/Read/Write) used to write this report — every attempt to save a copy under `docs\qaqc-ui\` (absolute Windows path, relative path, forward-slash path) failed with `ENOENT` because the two tools do not share a filesystem in this environment. No binary screenshot files could be persisted to `E:\works\car-retail\docs\qaqc-ui\`; that folder is empty. All visual evidence below is descriptive, backed by accessibility-tree snapshots and `browser_evaluate` computed-style sampling (exact hex/px values quoted).

---

## 0. Global chrome (applies to every page)

Design refs: 02 Home Desktop (header/footer), 05 Showrooms (footer)
Live: every route below shares one header/footer render.

| # | Sev | Element | Expected (design) | Actual (live) | Evidence |
|---|-----|---------|--------------------|----------------|----------|
| G1 | **blocker** | Header primary nav | 7 items: Trang chủ, Sản phẩm ▾ (dropdown), Khuyến mãi, Lái thử, Showroom, Tin tức, Liên hệ | Only 2 items: `News`, `About` (`nav "Main navigation"` contains exactly 2 `listitem`s on every page checked: home, test-drive, model-detail, showrooms) | a11y snapshot on all 4 routes: `navigation "Main navigation": list: listitem "News" /en/news, listitem "About" /en/about` |
| G2 | **blocker** | Showrooms page reachable from nav | "Showroom" is a top-level nav item in design | No link to `/en/showrooms` exists anywhere in the header nav **or** the footer "Quick links" column (About Us / Book Test Drive / Quote & Deposit / News & Campaigns / Policies / Contact) on any page. The route works when navigated to directly, but is an orphan page with zero in-app entry points. | Checked header nav + footer quick-links list on home, test-drive, model-detail, showrooms — no `/en/showrooms` href found in any |
| G3 | major | Footer "Showroom network" directory | 3-branch directory: Volta Auto Thủ Đức, Volta Auto Quận 7, Volta Auto Bình Dương (per design + design-system doc: "Hệ thống 3 showroom TP.HCM & Bình Dương") | Only 2 branches: Central Showroom (2S), District 7 Showroom (3S) — same 2-branch set repeats in every footer instance | a11y snapshot footer `list` under "Showroom network" heading = 2 `listitem`s, all 4 pages |
| — | pass | Footer background | footer/navy `#0B1F32` | `rgb(11, 31, 50)` = `#0B1F32` exact match | `browser_evaluate` computed `backgroundColor` on `[role=contentinfo]` |
| — | pass | Footer composition (4 columns: brand+legal / showroom list / quick links / contact) | present | present, structurally matches (minus branch count in G3) | snapshot |

---

## 1. Home — Desktop 1440

Live URL: https://car-retail.williamthanhtrung.id.vn/en
Design PNG: `car-retail-penpot-home-desktop.png`
Live screenshot: captured in-session (not persisted, see tooling note above)

| # | Sev | Element | Expected (design) | Actual (live) | Evidence |
|---|-----|---------|--------------------|----------------|----------|
| H1 | major | Benefit strip | 4 cards: Ưu đãi mỗi tháng / Trả góp đến 90% / Lái thử miễn phí / Dịch vụ 3S | Only 2 cards: "Test drive", "Trade-in" | `region "Benefits"` snapshot has exactly 2 items |
| H2 | major | "Xe dịch vụ / thương mại" (Service/commercial) model grid | 3-card row (Volta Metro, Volta Cargo Van, Volta Limo) | 1 card only (Cargo Van E) — grid collapses to a single narrow card instead of a 3-column row | snapshot: `heading "Service / commercial"` → `list` has 1 `listitem`; screenshot shows single card, not a filled 3-col grid |
| H3 | major | Promo countdown timer | "Kết thúc sau" digital countdown (days/hrs/min/sec boxes) inside the Summer-offer promo band | No countdown element present at all — promo band has only heading, 4-item checklist, disclaimer text and a single CTA button | `region "Summer offer — up to 10% off"` snapshot: heading, `list` (4 items), paragraph, link — no timer node; confirmed absent in full-page screenshot |
| H4 | major | News teaser | 3 news cards | 1 card only ("New electric lineup launch") — grid renders single card, large empty space to the right | `region "Updates from Volta Auto"` snapshot: `list` has 1 `listitem` |
| — | pass | Hero carousel | badge + H1 + subtext + 2 CTAs (filled + outline) + image right, dot pagination | Matches: `region "Home carousel"` has badge "July offer · 0% installment", H1, subtext, "Book test drive" (filled) + "Explore models" (outline), image | snapshot |
| — | pass | H1 type token | Display/H1 48/56 ExtraBold | `fontSize:48px, lineHeight:56px, fontWeight:800` — exact match | `browser_evaluate` on `h1` |
| — | pass | Price accent token | `#E8481F` | `rgb(232,72,31)` = `#E8481F` exact | `browser_evaluate` on price node "599.000.000đ" |
| — | pass | CTA fill token | `#C4370F` | `rgb(196,55,15)` = `#C4370F` exact | `browser_evaluate` on "Book test drive" |
| — | pass | Card radius | lg16 (16px) | `borderRadius: 16px` on `article` cards | `browser_evaluate` |
| — | pass | Eco chip | eco/500 `#1FA97A`, pill radius | `color: rgb(31,169,122)` = `#1FA97A`, `borderRadius: 999px` | `browser_evaluate` on "⚡ 100% Electric" chip |
| — | pass | "Xe cá nhân" (Personal) model grid | 3-card row | 3 cards present (City EV Compact, Urban MPV Plus, Family SUV Electric) | snapshot |
| — | pass | Social-proof gallery | 5-image grid, "Over N customers" | 5 items present | `region "Over 1,200 customers have taken delivery"` → 5 `listitem`s |
| — | pass | Inline lead form + consent | name/phone/model dropdown, consent checkbox linking Privacy Policy, disabled-until-valid CTA | Matches field-for-field | snapshot |

Console/network on this page: 0 console errors/warnings, 0 failed (4xx/5xx) requests.

---

## 2. Home — Mobile 390

Live URL: https://car-retail.williamthanhtrung.id.vn/en (resized to 390×844)
Design PNG: `car-retail-penpot-mobile-home.png`

| # | Sev | Element | Expected (design) | Actual (live) | Evidence |
|---|-----|---------|--------------------|----------------|----------|
| M1 | minor | Persistent bottom bar | Not present — design's mobile frame places contact affordances (Zalo, phone) as two small icons in the header only | Live adds a fixed bottom "Quick actions" tab bar with 3 items (Call / Zalo / Test drive) that stays pinned across all scroll positions | `navigation "Quick actions"` node with 3 links; visible in viewport screenshot at all scroll depths |
| M2 | minor | Model list disclosure | Shows only first 2 model cards + a "Xem tất cả 6 dòng xe" (View all 6 models) button — progressive disclosure pattern | All model cards render inline in one continuous list; no "view all" collapse/expand control found | snapshot region "Choose your electric vehicle" — full list rendered, no view-all control node |
| — | pass | Hamburger + centered logo + header icons | present | `button "Open menu"` + logo link present | snapshot |
| — | pass | Hero stacked CTAs | filled primary button then outline "Call ..." button, stacked full-width | Matches: "Book test drive" (filled) then "Call 1900 12 34 56" (outline, phone icon) stacked | viewport screenshot |
| — | pass | Lead form simplification | 2 required fields visible pattern | Home mobile lead form still shows full field set consistent with desktop (name/phone/model/consent) — not a mismatch since design's mobile lead-form frame isn't in the mapped set for this run | note only, not scored |

---

## 3. Test Drive

Live URL: https://car-retail.williamthanhtrung.id.vn/en/book-test-drive
Design PNG: `car-retail-penpot-test-drive.png`

| # | Sev | Element | Expected (design) | Actual (live) | Evidence |
|---|-----|---------|--------------------|----------------|----------|
| T1 | major | Showroom/map region location list | 3 locations ("Thủ Đức · Quận 7 · Bình Dương") | 2 locations ("Central Showroom - District 7 Showroom") — inherits global G3 data gap | `region "Showroom"` paragraph text |
| T2 | major | Showroom `<select>` in the registration form | 3 options | 2 options: "Central Showroom", "District 7 Showroom" | snapshot `combobox "Showroom"` |
| — | pass | Breadcrumb | "Trang chủ / Đăng ký lái thử" | "Home / Book a test drive" — same structure | snapshot |
| — | pass | "3-step process" block | 3 numbered steps | 3 numbered steps, headings + copy per step | snapshot matches 1:1 |
| — | pass | "Vì sao nên lái thử" checklist | 4 checked items | 4 checked items | snapshot: 4 `listitem`s |
| — | pass | Registration form fields | Full name, Phone, Province/City, Showroom, Model line, Preferred date, Note, consent checkbox, disabled-until-valid CTA, helper text below CTA | Field-for-field match | snapshot |
| — | pass | Two-column layout: left info rail + right form card | present | present | screenshot |

Console/network: 0 errors, 0 failed requests.

---

## 4. Model Detail (City EV Compact)

Live URL: https://car-retail.williamthanhtrung.id.vn/en/models/city-ev-compact
Design PNG: `car-retail-penpot-model-detail.png`

| # | Sev | Element | Expected (design) | Actual (live) | Evidence |
|---|-----|---------|--------------------|----------------|----------|
| D1 | major | Photo gallery | Large hero image + 5-thumbnail strip below (multi-angle browsing) + separate 7-swatch color row | Single static hero image + 3 color-swatch buttons only; **no thumbnail strip**, no way to browse multiple photos of the same variant | snapshot `region "Image gallery"`: 1 `img` + `list "Colors"` (3 buttons) — no thumbnail list node; screenshot confirms single image |
| D2 | major | Promo/offer callout box | Pink `accent/soft #FFF1EC`-background box with 3 bullet incentives (e.g. discount %, registration-fee waiver, free charging) positioned between price and variant selector | Not present at all — page goes straight from price to the variant radiogroup | snapshot: nothing between `generic "599.000.000đ"` and `radiogroup "Variants & pricing"`; confirmed visually absent |
| D3 | major | Feature-highlight storytelling section | 3 alternating image+copy blocks explaining specific selling points (turning radius/dimensions, infotainment/voice assistant, safety/airbags) | Reduced to a single flat 3-item spec strip (Range / Power / Seats) with no imagery or narrative copy | snapshot `region "Specifications"` = 3 `term`/`definition` pairs only; screenshot shows plain dark strip with 3 boxed stats, no image+text blocks |
| — | pass | Breadcrumb | present (compact) | "Home › Products › SUV › City EV Compact" | snapshot |
| — | pass | H2/H1 detail heading token | 34/42 Bold | `fontSize:34px, fontWeight:700` — matches H2 34/42 Bold token size | `browser_evaluate` |
| — | pass | Price token (detail page, larger size) | Price/Large 30/36 ExtraBold, `#E8481F` | `fontSize:30px, fontWeight:800, color: rgb(232,72,31)=#E8481F` | `browser_evaluate` |
| — | pass | Primary CTA "Book test drive" | fill `#C4370F` | `rgb(196,55,15)` exact | `browser_evaluate` |
| — | pass | Secondary CTA "Place deposit" (outline) | brand/700 navy `#123A5E` border/text | `border: 1px solid rgb(18,58,94)=#123A5E`, `color: rgb(18,58,94)` | `browser_evaluate` |
| — | pass | "Other models" related grid | 3-card row | 3 cards present | snapshot |
| — | pass | Variant selector component | radio-group list of trims w/ price+range per row | Present, correct visual pattern (only 1 trim populated for this model — data-only, acceptable) | snapshot |

Console/network: 0 errors, 0 failed requests.

---

## 5. Showrooms

Live URL: https://car-retail.williamthanhtrung.id.vn/en/showrooms *(reachable only by direct URL — see G2)*
Design PNG: `car-retail-penpot-showrooms.png`

| # | Sev | Element | Expected (design) | Actual (live) | Evidence |
|---|-----|---------|--------------------|----------------|----------|
| S1 | major | Region filter tabs | 3 tabs: "Tất cả (3)", "TP.HCM (2)", "Bình Dương (1)" | 2 tabs: "All (2)", "HCMC (2)" — no Bình Dương tab, inherits global G3 data gap | snapshot `tablist "Filter by city"`: 2 `tab`s |
| S2 | major | Showroom card grid | 3 cards | 2 cards — grid is 2/3 filled, same root cause as G3/T1/T2 | snapshot: 2 `article`s |
| — | pass | Page header (breadcrumb, H1, subtitle) | present | "Home / Showroom network", H1 "Volta Auto showroom network", subtitle "2 branches – sales, service and genuine parts..." — structurally matches (copy reflects live's 2-branch data, consistent internally) | snapshot |
| — | pass | Card composition (image, name+class badge, address, hours, phone, Directions + Book buttons) | present | Field-for-field match per card | snapshot |
| — | pass | "Haven't picked a branch?" CTA band | dark band, heading+subtext left, phone CTA right | Matches | snapshot |

Console/network: 0 errors, 0 failed requests.

---

## Summary

### Counts by severity
| Severity | Count |
|---|---|
| Blocker | 2 |
| Major | 12 |
| Minor | 2 |
| **Total findings** | **16** |

(Findings G3 / T1 / T2 / S1 / S2 all trace to one root cause — the live catalog only has 2 showroom branches seeded vs the design's 3 — counted once per page section since each manifests as a distinct visible UI delta on that page.)

### Counts by page
| Page | Blocker | Major | Minor |
|---|---|---|---|
| Global chrome | 2 | 1 | 0 |
| Home Desktop | 0 | 4 | 0 |
| Home Mobile | 0 | 0 | 2 |
| Test Drive | 0 | 2 | 0 |
| Model Detail | 0 | 3 | 0 |
| Showrooms | 0 | 2 | 0 |

### Design-token spot checks (all passed, no deltas)
CTA fill `#C4370F`, price accent `#E8481F`, footer navy `#0B1F32`, brand navy `#123A5E` (secondary CTA border), eco chip `#1FA97A` + pill radius, card radius `16px` (lg16), Display/H1 `48/56/800`, H2-scale detail heading `34px/700`, Price/Large `30px/800`, font-family `"Be Vietnam Pro"` throughout. No token-level color/type/radius regressions found — all structural/component-level.

**Note:** brand/language/copy differences (VOLTA AUTO vs Sample Auto Dealer, Vietnamese vs English, model names) are intentionally excluded from this review per the task's scope definition.
