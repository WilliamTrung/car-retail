# Frontend Architecture — car-retail public web v2 (Penpot design)

> Authored by the lead-frontend-architect. This is the **blueprint** the delegated
> implementation tickets (task-db `car-retail#T-0010..T-0017`) reference. It contains
> contracts and specifications only — no shipping code. The Penpot design is the single
> visual source of truth; this document is the single architectural source of truth.

---

## 1. Sources of truth

| What | Where |
|---|---|
| Design (canvas) | Penpot `https://penpot.williamthanhtrung.id.vn`, file `e63e3471-bc65-80b2-8008-55ace94ea3d6` |
| Frames | 01 Design System · 02 Home Desktop 1440 · 03 Test Drive · 04 Model Detail (Volta City) · 05 Showrooms · 06 Mobile 390 |
| PNG exports | `C:/Users/LEGION/.claude/agents/assets/ui-designer/car-retail-penpot-{design-system,home-desktop,test-drive,model-detail,showrooms,mobile-home}.png` |
| Design record | graph-memory `ui_designer` nodes `car-retail-wireframe-web-v2-penpot`, `car-retail-design-handoff-v2` |
| Backend contract surface | `web/src/server/modules/*/**.schema.ts` (Zod DTOs) + `web/src/lib/queries/public.ts` (read facade) |
| Component diagram | `docs/diagrams/frontend-architecture.drawio` |
| Stack rules | `.cursor/rules/nextjs-developer.mdc`, `docs/techstack.md`, `docs/project-context.md` |

**Stack (locked rework decisions):** Next.js 15 App Router, TypeScript strict
(`noUncheckedIndexedAccess`), React 19, Server Components default, next-intl 4
(vi default / en secondary, localized pathnames), plain **CSS Modules + CSS
custom-property tokens** (no Tailwind, no CSS-in-JS), next/image, next/font.
Data comes ONLY from `@/server/modules/*` services via `@/lib/queries/public.ts`
(or new facade functions added there) — **frontend components never import Prisma**.

---

## 2. Design tokens → CSS custom properties

Single file `web/styles/tokens.css`, imported first by `web/styles/globals.css`.
All component CSS Modules consume ONLY these vars — no literal hex/px in modules
(exceptions: 1px borders, 50%/100% and layout-local percentages).

### 2.1 Colors

| CSS var | Value | Role (from 01 Design System) |
|---|---|---|
| `--color-brand-900` | `#0C2439` | hero/carousel navy background, spec-strip band |
| `--color-brand-700` | `#123A5E` | primary brand, secondary buttons, headings accents |
| `--color-brand-500` | `#2B7DE0` | links, Zalo button `--color-zalo` alias |
| `--color-brand-soft` | `#EAF1F8` | soft brand tint backgrounds |
| `--color-accent-500` | `#E8481F` | PRICE text (large/bold only — AA large 3.9:1) |
| `--color-accent-600` | `#C4370F` | CTA button fills (white text AA 5.3:1), pulsing call FAB |
| `--color-accent-soft` | `#FFF1EC` | promo block background, promo chip tint |
| `--color-eco-500` | `#1FA97A` | eco chip ONLY (never core UI) |
| `--color-surface-50` | `#F4F6F9` | section alternate background |
| `--color-surface-100` | `#EAEEF4` | image placeholder fill, subtle panels |
| `--color-bg` | `#FFFFFF` | page background |
| `--color-text-900` | `#1F2937` | body text |
| `--color-text-muted` | `#5B6672` | secondary text, captions |
| `--color-text-on-dark` | `#FFFFFF` | text on navy/accent |
| `--color-border-200` | `#E3E8EF` | borders, dividers |
| `--color-gold-500` | `#F5A623` | footer heading accents, rating cues |
| `--color-footer-navy` | `#0B1F32` | trust footer + mobile bottom bar background |

### 2.2 Radius / spacing / elevation / container

```
--radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-pill: 999px;
--space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
--space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px; --space-24: 96px;
--shadow-card: 0 4px 16px rgba(16,42,67,.08);
--shadow-raised: 0 8px 28px rgba(0,0,0,.14);
--container-max: 1280px;   /* content column inside the 1440 frame (40–80px gutters) */
--container-pad: clamp(16px, 4vw, 80px);
--header-h: 72px;          /* reserve to avoid CLS under sticky header */
--bottombar-h: 64px;       /* mobile bottom action bar reserve */
```

### 2.3 Typography — Be Vietnam Pro (next/font)

Load with `next/font/google` → `Be_Vietnam_Pro`, subsets `["latin", "vietnamese"]`,
weights `400,500,600,700,800`, `display: "swap"`, exposed as `--font-sans` on `<html>`.
13-style scale as vars + utility classes in `globals.css`:

| Style | Spec | CSS var prefix |
|---|---|---|
| Display/H1 | 48/56 ExtraBold 800 | `--text-h1` |
| H2 | 34/42 Bold 700 | `--text-h2` |
| H3 | 24/32 SemiBold 600 | `--text-h3` |
| H4/Card | 20/28 SemiBold 600 | `--text-h4` |
| Body Large | 18/28 Regular | `--text-body-lg` |
| Body Base | 16/26 Regular | `--text-body` |
| Body Small | 14/20 Regular | `--text-body-sm` |
| Caption | 12/16 Medium 500 | `--text-caption` |
| Overline | 13/16 Bold 700 caps +0.08em | `--text-overline` |
| Price Large | 30/36 ExtraBold 800, accent-500 | `--text-price-lg` |
| Price Base | 22/28 Bold 700, accent-500 | `--text-price` |
| Button | 16/24 SemiBold 600 | `--text-button` |
| Nav | 15/20 Medium 500 | `--text-nav` |

Mobile (≤640px): H1 → 34/42, H2 → 28/36 (per 06 Mobile frame). Prices keep
`font-variant-numeric: tabular-nums` where they animate (countdown).

### 2.4 Breakpoints

Mobile-first. `--bp-sm: 640px`, `--bp-md: 900px`, `--bp-lg: 1200px`.
Design anchors: 390 (mobile frame) and 1440 (desktop frame).
Model grid: 1 col ≤640 · 2 cols 641–1199 · 3 cols ≥1200. Footer: 1 col ≤640 ·
2 cols 641–899 · 4 cols ≥900. Test Drive: form stacks above trust panel ≤900.

### 2.5 Motion

Restrained only: hero auto-advance ~5s, card hover-lift (translateY(-4px) +
`--shadow-raised`), phone FAB pulse (box-shadow keyframe). **Every animation gated
behind `@media (prefers-reduced-motion: no-preference)`**; carousel auto-advance
disabled under reduced motion. No parallax.

---

## 3. Atomic component inventory

All public UI under `web/src/components/` (new). Server Component unless marked
`[client]`. Each component gets a colocated `*.module.css`.

### Atoms — `components/ui/`
| Component | Notes |
|---|---|
| `Button` | variants `primary`(accent-600) `secondary`(brand-700) `outline` `dark-outline` `ghost` `zalo`(brand-500); sizes `md/lg`; renders `<a>` or `<button>`; `loading` state (spinner + disabled) |
| `Chip` | variants `eco`(⚡ 100% Điện) `spec` `tag` `promo` `darkTag` |
| `PriceText` | VND format `285.000.000đ` via shared `formatVnd()` (`Intl.NumberFormat('vi-VN')` + `đ`); sizes `lg/base`; renders `—` + "Liên hệ" fallback when null |
| `SectionTitle` | overline + H2 + optional sub, center/left |
| `SmartImage` | wraps `next/image`; required `aspectRatio`; surface-100 placeholder block w/ muted caption when `src` null (design's "Ảnh …" placeholders); `sizes` required |
| `FormField` | label + required mark + input/select/textarea/date slots + error slot; `aria-describedby` wiring |
| `ConsentCheckbox` | checkbox + text w/ link to `/chinh-sach` (localized); invalid state |
| `Icon` | inline SVG sprite set (phone, zalo, arrow, check, pin, clock, menu, close, chevron, socials) — static assets, no icon lib |

### Molecules — `components/ui/`
| Component | Notes |
|---|---|
| `ModelCard` | price-from card variant C: SmartImage 4:3 · eco chip + ALL-CAPS tagline overline · H4 name · 3 spec chips · "Giá từ" + PriceText · promo line (accent, 1-line clamp) · actions `Xem chi tiết`(outline) + `Lái thử / Tư vấn`(primary). Hover-lift. |
| `NewsCard` | image 16:9, tag chip + date, H4 clamp-2, "Xem chi tiết →" link |
| `DeliveryCard` | gallery photo 4:3 + caption "Model · Branch" |
| `BenefitItem` | icon + title + 2-line text |
| `CountdownTimer` `[client]` | props `endsAt: string(ISO)`; 4 cells Ngày/Giờ/Phút/Giây, tabular-nums, fixed cell width (no CLS); on expiry calls `onExpire`/renders fallback; interval cleaned up; SSR-safe initial render from server time |
| `LangSwitcher` `[client]` | VI/EN pill using next-intl `Link`/`usePathname` locale switch |
| `SpecCell` | key/value/unit cell for the navy spec strip — label from `t('spec.'+key)`, unit from units map |
| `VariantCard` `[client-parent]` | radio-style selectable variant (name, price, chips); selection lives in parent island |
| `ShowroomCard` | photo/map thumb, name + 3S/2S chip, address, hours, tel: hotline, "Chỉ đường" Maps link, branch CTA → `/dang-ky-lai-thu?showroom=<id>` |
| `FaqItem` | `<details>/<summary>` native disclosure (no JS) |

### Organisms — `components/layout/` + per-page dirs
| Component | Notes |
|---|---|
| `SiteHeader` | sticky; logo, 7-item nav (from `getMenuItems("HEADER")`), LangSwitcher, Zalo btn, hotline CTA; ≤900px collapses to `MobileNav` `[client]` drawer (hamburger + persistent Zalo/call icons) |
| `SiteFooter` | navy 4-col: brand+desc+socials+legal (CÔNG TY … + MST + HQ) · showroom directory (3 branches, type chip, tel) · quick links (`getMenuItems("FOOTER")`) · contact (big hotline, email, hours, Zalo OA btn); bottom bar |
| `FloatingContactCluster` `[client]` | fixed bottom-right: pulsing call FAB (accent-600, `tel:`), Zalo FAB (brand-500, `zalo.me` deep-link), back-to-top (appears after 1 viewport); hidden ≤900px when `MobileActionBar` present |
| `MobileActionBar` `[client]` | ≤900px only, pinned bottom, navy, 3 equal actions Gọi · Zalo · Lái thử, top shadow, safe-area inset |
| `HeroCarousel` `[client]` | slides from `getHeroSlides()`; slide 1 SSR-rendered for LCP; promo chip, H1, sub, CTA cluster, image right; dots + arrows; auto-advance 5s, pause on hover/focus, respects reduced motion |
| `BenefitStrip`, `ModelGridSection` (segmented "Xe cá nhân"/"Xe dịch vụ / thương mại"), `CtaBand`, `PromoSection` (accent-soft, bullets, CountdownTimer, date range), `DeliveryGallery`, `NewsTeaser` | Home sections — server components |
| `LeadForm` `[client]` | one component, 3 presets (see §5): `consult` (home inline + mobile compact), `test_drive` (full page 03), `deposit`; posts to `POST /api/leads` |
| `GalleryHero` `[client]` | model detail: main image + 5 thumbs + up to 9 color swatches (swatch switches main image when mapped) |
| `VariantSelector` `[client]` | wraps VariantCards; selected variant drives displayed price + CTA hrefs |
| `SpecStrip` | navy band of `SpecCell`s (server — composes from attributes+units+messages) |
| `FeatureSections` | alternating image/text rows from model `featureSections` |
| `RelatedModels` | 3 ModelCards |
| `ShowroomDirectory` `[client-tabs]` | filter tabs (Tất cả/TP.HCM/Bình Dương) + ShowroomCard grid; tabs are the only client part |

---

## 4. Data contracts (TypeScript interfaces — spec)

**Rule: the server DTOs in `web/src/server/modules/*/**.schema.ts` are authoritative.**
The frontend adds *view models* in `web/src/lib/view-models/` composed by pure mapper
functions (unit-testable, no React). Attribute display is ALWAYS composed client-side
from `{key,value,unit}` + `messages/*.json` (`spec.*`) + units map — the server never
sends labels.

```ts
// web/src/lib/view-models/common.ts
export type Locale = "vi" | "en";
export interface Localized { vi: string; en: string }               // matches DB {vi,en} JSON
export interface VehicleAttribute {                                  // matches API contract
  key: string; value: string | number; unit?: string | null;
}
export type UnitsMap = Record<string, Localized>;                    // from getUnits(): key → label
// display composition (pure fn spec):
//   attrLabel = t(`spec.${attr.key}`)
//   attrDisplay = `${attr.value}${attr.unit ? " " + units[attr.unit]?.[locale] ?? attr.unit : ""}`

// web/src/lib/view-models/model-card.ts
export interface ModelCardVM {
  id: string; slug: string;              // slug already locale-resolved
  name: string;
  taglineOverline: string;               // ALL-CAPS overline, locale-resolved
  imageUrl: string | null;               // null → SmartImage placeholder
  imageAlt: string;
  isEv: boolean;                         // eco chip "⚡ 100% Điện"
  specChips: string[];                   // exactly 3 composed strings, e.g. "326 km (NEDC)", "5 chỗ", "130 Nm"
  priceFromVnd: number | null;           // min published variant price; null → "Liên hệ"
  promoLine: string | null;              // per-card promo, accent text
  segment: "personal" | "commercial";    // grid grouping
  detailHref: string; leadHref: string;  // localized hrefs
}

// web/src/lib/view-models/model-detail.ts
export interface VariantVM {
  id: string; name: string; priceVnd: number | null;
  chips: string[]; isDefault: boolean;
  allowsDeposit: boolean; allowsTestDrive: boolean;
}
export interface ModelDetailVM {
  id: string; slug: string; name: string; taglineOverline: string;
  isEv: boolean;
  gallery: { mainUrl: string | null; thumbs: string[]; alt: string };
  colorSwatches: { name: string; hex: string; imageUrl?: string | null }[]; // ≤9
  priceFromVnd: number | null;
  variants: VariantVM[];                 // ≥1; radio cards
  promo: { bullets: string[]; dateRange: string | null } | null;
  featureSections: { title: string; body: string; imageUrl: string | null; imageLeft: boolean }[];
  specStrip: { key: string; display: string; label: string }[]; // ≤7 cells, composed
  related: ModelCardVM[];               // ≤3
  faqs: { q: string; a: string }[];
}

// web/src/lib/view-models/showroom.ts
export interface ShowroomVM {
  id: string; name: string;
  typeTag: "1S" | "2S" | "3S";
  address: string; hours: string;
  city: string; cityKey: string;         // filter-tab key, e.g. "hcm" | "binh-duong"
  hotline: string;                       // display "0900 111 222"; href `tel:+84…` normalized
  mapsUrl: string;                       // Google Maps deep-link from lat/lng or address
  imageUrl: string | null;
  bookHref: string;                      // /dang-ky-lai-thu?showroom=<id> (localized)
}

// web/src/lib/view-models/lead.ts        (client → POST /api/leads)
// MUST stay assignable to CreateLeadInput (web/src/server/modules/leads/leads.schema.ts)
export type LeadType = "TEST_DRIVE" | "DEPOSIT" | "CONSULT";
export interface LeadFormValues {
  type: LeadType;
  fullName: string;                      // required, ≥2 chars
  phone: string;                         // required, VN mobile regex /^(0|\+84)(\d{9})$/ after stripping spaces
  consent: true;                         // literal true — submit disabled until checked
  modelId?: string | null;               // "Dòng xe" select
  showroomId?: string | null;            // test_drive only
  province?: string | null;              // test_drive only (Tỉnh/Thành select)
  preferredDate?: string | null;         // test_drive only, ISO date, ≥ today
  note?: string | null;
  locale: Locale;
}
export type LeadSubmitState =
  | { status: "idle" } | { status: "submitting" }
  | { status: "success" }                                  // success card per design 03
  | { status: "error"; message: string };                  // inline alert + hotline fallback

// web/src/lib/view-models/home.ts
export interface HeroSlideVM {
  id: string; promoChip: string | null; title: string; subtitle: string | null;
  primaryCta: { label: string; href: string }; secondaryCta?: { label: string; href: string } | null;
  imageUrl: string | null; imageAlt: string;
}
export interface PromoVM {
  overline: string; title: string; bullets: string[];       // ≤5
  endsAt: string | null;                                    // ISO — null → hide countdown, keep bullets
  dateRangeNote: string; ctaLabel: string; ctaHref: string;
}
export interface NewsTeaserVM { id: string; slug: string; title: string; tag: string; tagKind: "promo"|"service"|"news"; date: string; imageUrl: string | null; href: string }
export interface DeliveryItemVM { id: string; imageUrl: string | null; caption: string }

// web/src/lib/view-models/site.ts
export interface SiteChromeVM {                              // header+footer+floating (fetched once in [locale]/layout)
  logoText: { primary: string; accent: string };             // "VOLTA" + "AUTO"
  nav: { label: string; href: string }[];
  hotline: { display: string; tel: string };                 // "1900 23 45 67" / "tel:1900234567"
  zaloUrl: string;
  legal: { companyName: string; mst: string; hqAddress: string; copyright: string };
  socials: { kind: "facebook"|"youtube"|"zalo"|"tiktok"|"instagram"; url: string }[];
  showrooms: ShowroomVM[];                                   // footer directory + showrooms page share this
  footerLinks: { label: string; href: string }[];
  contactEmail: string; workingHours: string;
}
```

Mappers to spec (pure, in `web/src/lib/view-models/mappers.ts`):
`toModelCardVM(model, units, t, locale)`, `toModelDetailVM(...)`, `toShowroomVM(...)`,
`toSiteChromeVM(settings, hotlines, showrooms, menuItems, locale)`. Each tolerates
missing optional data (null-safe) and never throws on partial CMS content.

---

## 5. Lead form matrix (fields per preset — verbatim vi labels from design)

| Field | consult (home/mobile) | test_drive (03) | deposit |
|---|---|---|---|
| Họ tên * | ✓ | ✓ | ✓ |
| Số điện thoại * | ✓ | ✓ | ✓ |
| Dòng xe (select) | ✓ ("Dòng xe quan tâm") | ✓ | ✓ (preselected from model page) |
| Tỉnh/Thành (select) | — | ✓ | — |
| Showroom (select) | — | ✓ (prefill from `?showroom=`) | — |
| Ngày mong muốn (date) | — | ✓ | — |
| Ghi chú (textarea) | — | ✓ | ✓ |
| Consent checkbox * | ✓ | ✓ | ✓ |
| Submit label | "Nhận tư vấn miễn phí" | "Đăng ký lái thử" | "Đặt cọc / Tư vấn" |

Behavior: client-side validation mirrors `CreateLeadInputSchema` (reuse the Zod schema
via import — single source); errors inline per-field on blur+submit; submit disabled
while `submitting`; on 429 show "Bạn thao tác quá nhanh…" retry message; on success show
the green success card (03 design): "Đăng ký thành công!" + callback reassurance
("tư vấn viên sẽ gọi lại từ số 1900 23 45 67 trong 5 phút", localized via messages);
on network/5xx error show inline alert + hotline fallback link. Never clear entered
values on error. Caption under test-drive submit: "Sau khi gửi, chúng tôi gọi xác nhận
trong 5 phút (8:00–20:00)".

---

## 6. Server/client island map & Core Web Vitals plan

**Server Components by default.** Client islands ONLY: `HeroCarousel`, `CountdownTimer`,
`LeadForm`, `LangSwitcher`, `MobileNav`, `FloatingContactCluster`, `MobileActionBar`,
`GalleryHero`, `VariantSelector`, `ShowroomDirectory` tabs. Everything else stays server.

| CWV | Target | Decisions |
|---|---|---|
| LCP | ≤2.5s | Hero slide 1 image = `next/image` `priority` + `fetchpriority=high`, `sizes="(max-width: 900px) 100vw, 50vw"`; navy `--color-brand-900` painted as CSS background (LCP-safe even with placeholder image); carousel JS hydrates around SSR'd slide 1 (no client-only render); Be Vietnam Pro via next/font (self-hosted, `display:swap`, vietnamese subset) — zero external font request |
| CLS | <0.1 | every image inside aspect-ratio box; `--header-h` reserved; countdown cells fixed-width tabular-nums; font metric fallback via next/font `adjustFontFallback`; mobile bottom bar reserved with `padding-bottom: var(--bottombar-h)` on body ≤900px |
| INP | <200ms | islands are leaf-level; countdown uses a single `setInterval` (1s) with functional state; carousel uses CSS transform transitions; no scroll listeners except one passive IntersectionObserver for back-to-top; ShowroomDirectory filters client-side over already-rendered cards (CSS hide, no refetch) |

Code-splitting: route-level automatic; below-fold client islands (`CountdownTimer`,
`DeliveryGallery` if animated, `GalleryHero` thumbs interactions) loaded via
`next/dynamic` with SSR'd fallbacks. No new runtime deps — carousel/countdown/tabs are
hand-rolled (small, token-styled) rather than library imports.

Caching: pages are static/ISR-compatible; data reads go through service layer which
already tags caches; admin writes `revalidateTag` (backend lane, done). No client fetch
for initial render anywhere; the ONLY client mutation is `POST /api/leads`.

---

## 7. States matrix (defensive plan)

| Surface | loading | empty | error | success/extra |
|---|---|---|---|---|
| Any CMS image | surface-100 block (SSR, no spinner) | placeholder w/ caption | placeholder | — |
| Model grid | SSR — no client loading | segment with 0 models → hide that segment block; both empty → hide section | — | 6+ models per design |
| Hero carousel | SSR slide 1 | 0 slides → static navy hero w/ site default headline from messages | — | dots hidden if 1 slide |
| Countdown | SSR initial values | `endsAt` null → bullets only, no timer | — | expired → hide timer, keep "Áp dụng …" date note |
| Lead forms | submit spinner + disabled | — | inline alert + tel: fallback; 429 retry message; field errors inline | success card (03), form hidden |
| News teaser | SSR | 0 posts → hide section | — | max 3 |
| Showrooms | SSR | tab with 0 branches → "Chưa có showroom" muted note | — | filter is client-side CSS toggle |
| Model detail | SSR | model not published/found → `notFound()` 404 | — | variant with null price → "Liên hệ" |
| Spec strip | SSR | <1 attributes → hide band | unknown `spec.*` key → fall back to raw key (never crash) | ≤7 cells |

A11y baseline (every ticket): semantic landmarks (`header/nav/main/footer`), one `h1`
per page, focus-visible rings (brand-500 2px), form fields labelled + `aria-invalid`
+ `aria-describedby` errors, carousel `aria-roledescription="carousel"` + pause button,
countdown `aria-live="off"` (decorative) with a static text alternative, color contrast
per token sheet (accent-500 only for ≥22px bold text), all icons `aria-hidden` with text
or `aria-label` on icon-only buttons, keyboard-operable tabs/carousel/gallery.

---

## 8. Routes & data-fetch map (existing localized pathnames)

| Route (vi / en) | Page | Fetches (via `@/lib/queries/public.ts`) |
|---|---|---|
| `/vi` · `/en` | Home | heroSlides, serviceBlocks(benefits), publishedModels+units, promo(homepage), featuredNews(3), showrooms(footer), settings, menus |
| `/vi/models/[slug]` | Model detail | modelBySlug(locale,slug)+details, units, showrooms |
| `/vi/dang-ky-lai-thu` · `/en/book-test-drive` | Test drive | models(list for select), showrooms, settings |
| `/vi/dat-coc` · `/en/deposit` | Deposit | models, settings |
| `/vi/showroom` (new if missing) | Showrooms | showrooms, settings |
| all | layout chrome | `toSiteChromeVM` inputs fetched once in `[locale]/layout.tsx` |

`SiteChromeVM` is composed in the locale layout and passed down — header/footer/floating
cluster never fetch independently.
