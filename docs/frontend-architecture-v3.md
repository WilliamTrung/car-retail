# Frontend Architecture — car-retail v3 "Electric Ink" (full visual redesign)

> Authoritative blueprint for the **nextjs-frontend-developer** lane. Supersedes the visual
> layer of `docs/frontend-architecture.md` (v2). **Same IA, same backend contracts, same
> view-model surface** — this is a *visual re-skin* + one net-new catalog route + one net-new
> promotions route. Do NOT rewrite the data layer; retheme tokens, upgrade three shared
> primitives, add two routes, and restyle the four screens.
>
> Design source of truth: Penpot file `e63e3471-bc65-80b2-8008-55ace94ea3d6` @
> penpot.williamthanhtrung.id.vn — pages V3·01 Design System / V3·02 Home / V3·03 Products /
> V3·04 Model Detail. Design node: `ui_designer/car-retail-wireframe-web-v3-penpot`.
> Architecture node: `lead_frontend_architect/car-retail-frontend-architecture-v3`.

## 0. What changes vs v2 (delta map)

| Area | v2 (shipped) | v3 "Electric Ink" |
|---|---|---|
| Palette | brand #123A5E, accent #E8481F | **cooler/deeper ink** ink/900 #0B1522 · ink/700 #1C3A5E (primary btn) · price #EA3C1E · cta #C4330F · eco #0F8A5F |
| Radii | sm8/md12/lg16 | **sm10/md14/lg20/xl28/pill** (softer, signals redesign) |
| Spacing | 8px scale, max 1280 | 8px scale, **content max 1200**, section gutters 120 |
| Elevation | card 0 4 16 | **card 0 6 24 rgba(11,21,34,.08) / hover 0 14 40 …/.16**; flat (shadowless) variant for dense grids |
| Type | H1 48/56 | **Display 60/64, H1 44/52, Price/L 32/36** — Be Vietnam Pro kept |
| Images | `SmartImage` (loaded + placeholder that leaks `Ảnh <alt>`) | **loaded / skeleton / error-fallback** (branded glyph + localized "Image coming soon", NEVER raw alt) |
| Countdown | always-live timer | **conditional**: live only ≤14 days, else **static date badge** |
| Price EN | `749.000.000 VND` | **`₫749,000,000`** (₫ prefix + comma); VI stays `749.000.000đ` |
| Spec chips | first-3 attrs, pad `"—"` | **fixed Range·Power·Seats** (icon+value+unit), never a bare dash |
| Routes | `/models/[slug]` only | **+ `/models` catalog listing (net-new)**, **+ `/promotions` (net-new, distinct from `/news`)** |
| Nav "Promotions" | `routeKeyToHref` → `/news` (BUG) | → **`/promotions`** |

## 1. Token retheme (Electric Ink) — `web/styles/tokens.css`

Edit the existing `:root` **in place** (keep var names where components already bind them; add
new ones). Normative values (from Design System frame `…59be18e6924e`):

**Colors** — `--color-ink-900:#0B1522` (hero+footer bg) · `--color-ink-800:#12233A` ·
`--color-brand-700:#1C3A5E` (primary btn, white AA ~8:1) · `--color-brand-500:#2563EB` (link) ·
`--color-ink-soft:#EEF3FA` · `--color-accent-500:#EA3C1E` (large price text ONLY) ·
`--color-accent-600:#C4330F` (CTA fills, white AA 5.2:1) · `--color-accent-soft:#FFF1EC` ·
`--color-eco-500:#0F8A5F` (eco chip ONLY) · `--color-eco-soft:#E3F5EC` ·
`--color-surface-50:#F6F8FB` · `--color-surface-100:#EDF1F7` (skeleton base) ·
`--color-surface-200:#E1E8F1` · `--color-text-900:#111C2B` · `--color-text-700:#384456` ·
`--color-text-muted:#677486` · `--color-border-200:#E2E8F1` · `--color-gold-500:#F2B01E` (rating) ·
`--color-amber-500:#F59E0B` (live countdown) · `--color-zalo:#2B7DE0` · `--color-footer-navy` → `#0B1522`.

**Radius** sm10/md14/lg20/xl28/pill999. **Elevation** `--shadow-card:0 6px 24px rgba(11,21,34,.08)`,
`--shadow-raised:0 14px 40px rgba(11,21,34,.16)`. **Container** max **1200**. **Type scale**:
Display 60/64 w800, H1 44/52 w800, H2 32/40 w700, H3 24/30 w600, H4 20/26 w600, BodyL 18/28,
Body 16/26, Small 14/22, Caption 13/18 w500, Overline 12/16 w700 +0.08em caps,
Price/L 32/36 w800, Price/M 22/26 w700, Button 16/24 w600, Nav 15/22 w500. Mobile (≤640):
Display→40/44, H1→34/42, H2→28/36. AA guard: CTA fill `--color-accent-600` + white; price text
`--color-accent-500` at ≥Price/M sizes only.

## 2. Shared primitive upgrades (contracts)

### 2.1 `SmartImage` → first-class image states (fixes broken-images + i18n-leak, the #1 live defect)
Client leaf. States: **loaded / skeleton / error**. Remove the `Ảnh ${alt}` caption leak.

```ts
type ImageState = "loading" | "loaded" | "error";
interface SmartImageProps {
  src: string | null | undefined;
  alt: string;                 // real localized alt on the <img> for a11y ONLY — never rendered as visible text
  aspectRatio: string;         // reserves box → zero CLS (required)
  sizes: string;
  priority?: boolean;
  fill?: boolean; width?: number; height?: number;
  className?: string; imgClassName?: string;
}
```
- `src == null` OR `onError` → render the **branded fallback**: car glyph (inline SVG, currentColor) +
  a **localized** caption from next-intl `image.comingSoon` ("Hình ảnh sắp ra mắt" / "Image coming soon").
  The `alt` string is NEVER shown as visible text.
- While the real `<img>` is decoding → **skeleton** (shimmer over `--color-surface-100`), swapped
  out on `next/image` `onLoad`. `prefers-reduced-motion` → static tint, no shimmer animation.
- Every card / hero / gallery / thumbnail uses this. Catalog + lineup must show error/skeleton
  in-context per design. Message keys: `image.comingSoon`, `image.loading` (sr-only).

### 2.2 Bilingual price — `web/src/lib/format.ts` + `PriceText`
```ts
formatVnd(amount, locale): // vi → "749.000.000đ" ; en → "₫749,000,000" (₫ prefix + comma groups)
```
Update `formatCardPrice`/`formatPriceFrom` accordingly (EN currently emits `… VND` — change to the
`₫`-prefixed comma form). `PriceText` takes `locale`; large sizes use `--color-accent-500`.

### 2.3 Fixed spec-chip schema — `mappers.ts composeSpecChips` + `ModelCardVM`
Replace "first 3 attributes, pad with `—`" with an **ordered keyed pick: Range · Power · Seats**,
each `{icon, value, unit}`, in that fixed order on EVERY card. Missing value → a neutral
placeholder ("—" is banned as a bare chip; show the label with an em-dash-free "N/A"/"—" *inside*
the labeled chip, i.e. icon+label present, value graceful). Extend `ModelCardVM`:
```ts
interface SpecChipVM { key: "range" | "power" | "seats"; icon: string; value: string; unit: string; }
interface ModelCardVM { /* …existing… */ specChips: SpecChipVM[]; /* exactly 3, fixed order */ }
```
Map source attribute keys → the three slots (range/pin/quãng đường; power/công suất/kW/hp;
seats/số chỗ/chỗ). Keep the existing `composeAttributeDisplay` for value+unit formatting.

### 2.4 Conditional countdown — `CountdownTimer` + a `PromoTiming` decision
`CountdownTimer` already renders deterministically (React #418 fixed) and accepts `fallback`.
Add the **decision** in the promo view-model / parent, not new timer internals:
```ts
type PromoTiming =
  | { mode: "live"; endsAt: string }        // daysUntil(endsAt) ≤ 14 → live ticking timer
  | { mode: "static"; validUntilLabel: string }; // else → static "Valid until <date>" badge (no JS timer)
```
`daysUntil > 14` (or no endsAt) → render a static `DateBadge` ("Còn hiệu lực đến …" / "Valid until …");
`≤ 14` → `<CountdownTimer endsAt=… />`. Home Summer Festival = live; Model-detail promo = static.

## 3. Routing additions — `web/src/lib/i18n/routing.ts` + `mappers.ts`
Add to `pathnames`:
```ts
"/models":      { vi: "/models",       en: "/models" },        // catalog listing (net-new)
"/promotions":  { vi: "/khuyen-mai",   en: "/promotions" },    // net-new, DISTINCT from /news (vi /tin-tuc)
```
In `mappers.ts routeKeyToHref`, change `promotions: "/news"` → `promotions: "/promotions"` and
`products: "/models"` stays. This is the concrete dead-nav fix.

## 4. Screen builds (reuse existing components; restyle + wire)

**Home** (`app/[locale]/page.tsx` + `components/home/*`): sticky header, split ink hero with **1
primary ("Book a test drive"→lead) + 1 secondary ("Explore models"→/models)**, 4-benefit strip,
segmented lineup tabs (All/Personal/Service/Van) of redesigned cards (one shows error-fallback
in-context), mid ink CTA band, promo block with **conditional countdown** + "See all
promotions"→**/promotions**, delivery gallery (captions bound to `{model · branch}` entity),
news teaser, inline lead form, ink/900 trust footer, floating cluster. **"View all 12 models"→/models.**

**Products/Catalog** (`app/[locale]/models/page.tsx` — NET-NEW): ink title band + breadcrumb +
**honest count** — render the real published count; header must not claim "12" while drawing 9.
Use `getPublishedModels()` (already in `lib/queries/public.ts`; needs no backend change). Either
render ALL models, or show "Showing N of {total} · Load more". Sticky filter sidebar
(segment/price/seats/range + reset), sort field, responsive result grid of **flat (shadowless)**
cards, skeleton state. Client filtering over the server-fetched list (leaf island); page shell is a
Server Component.

**Model Detail** (`app/[locale]/models/[slug]/page.tsx` + `components/models/*`): gallery hero +
thumbs (incl skeleton) + color swatches, info panel (eco chip, big **From** price, variant radio
cards, **STATIC** promo badge + bullets, CTA cluster Reserve/Test drive/Call/Zalo), structured
**7-field navy spec table** (Range/Seats/Torque/Battery/Motor/Fast charge/0-50), 3 alternating
feature sections, 3 related model cards. `toModelDetailVM` already yields `specStrip` (≤7),
`variants`, `promo`, `colorSwatches`, `featureSections`, `related` — bind to them.

**Promotions** (`app/[locale]/promotions/page.tsx` — NET-NEW): a real listing page **distinct from
/news**. No backend promotions service exists yet, so v3 scope = the route exists, is distinct,
renders the available promo data (home promo block source / marketing-copy), and is the resolved
target of the Promotions nav item + home promo CTA. `ponytail:` mark a full CMS-backed promotions
module as a backend follow-up (out of this frontend track). News/Showrooms/About pages are
preserved untouched.

## 5. States matrix (every screen)
loading (skeleton on images + list) · empty (no models/promos → localized empty state, never a
blank grid) · error (image error-fallback; failed fetch → graceful section) · success. Lead form:
rejects submit without consent, shows success/callback state.

## 6. CWV plan
- **LCP**: hero image `priority`, explicit dimensions; ink hero bg is CSS (no image dependency).
- **CLS = 0**: `SmartImage` reserves box via `aspectRatio`; skeleton occupies final box; countdown
  pre-mount renders the same 4-cell layout (already done).
- **INP**: catalog filtering is client-side over already-fetched data (no round-trips); carousel &
  marquee honor `prefers-reduced-motion`; countdown is a single 1s interval, `aria-live="off"`.
- Server Components by default; client islands only: HeroCarousel, CountdownTimer, LeadForm,
  LangSwitcher, MobileNav, **CatalogFilters** (new leaf), SmartImage (state).
- Serialize build/e2e verification — never run concurrently with Cursor's lane (shared `.next`).

## 7. A11y
Single visible `<h1>`/section heading; duplicate headings → `sr-only`. Labeled form fields,
visible focus, AA contrast via the documented token pairs, keyboard-operable gallery thumbs &
filter controls, `prefers-reduced-motion` respected. Bilingual: every string in vi + en messages;
localized pathnames.
