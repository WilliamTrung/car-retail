# QA/QC Test Case Suite — car-retail

Authoring phase only. **No live execution performed** — no running app URL was
available at authoring time. All cases derived statically from:

- **docs/** — `project-context.md`, `frontend-architecture.md`,
  `implementation-plan.md`, `techstack.md`, `reference-site-layouts.md`,
  `deploy-checklist.md`
- root `README.md`
- **web/ source** (Next.js App Router) — `web/src/app/**`, `web/src/components/**`,
  `web/src/server/**`, `web/src/lib/**`, `web/src/middleware.ts` — read via
  Read/Grep/Glob only, no browser launched

Origin tags: `docs` (derived from documentation) · `ui` (derived from reading
source components/routes — stands in for "UI/UX of the running app" since no
live app was reachable this run).

Execution status: **PENDING** — none of these cases have been run against a
live instance. Provide a reachable URL (and seeded test data / admin
credentials for authed flows) to proceed to the execution phase.

---

## 1. Global — i18n, routing, locale handling

Source: `docs/project-context.md` §4, `web/src/lib/i18n/routing.ts`,
`web/src/middleware.ts`

**[origin: docs] Default locale redirect**
precondition: none
steps: Navigate to `/` (no locale segment)
expected: Redirects to `/vi` (default locale, `localePrefix: "always"` per `routing.ts`)

**[origin: ui] Vietnamese localized slugs resolve**
precondition: none
steps: Navigate to `/vi/dang-ky-lai-thu`, `/vi/dat-coc`, `/vi/tin-tuc`, `/vi/ve-chung-toi`, `/vi/lien-he`, `/vi/chinh-sach`, `/vi/ho-tro`, `/vi/showroom`
expected: Each resolves to Test Drive / Deposit / News / About / Contact / Policies / Support / Showrooms pages respectively, per `routing.ts` pathnames map

**[origin: ui] English localized slugs resolve**
precondition: none
steps: Navigate to `/en/book-test-drive`, `/en/deposit`, `/en/news`, `/en/about`, `/en/contact`, `/en/policies`, `/en/support`, `/en/showrooms`
expected: Each resolves to the equivalent English-locale page; content copy is in English

**[origin: ui] Cross-locale slug is not reachable under wrong locale**
precondition: none
steps: Navigate to `/en/dang-ky-lai-thu` (vi-only slug under en locale)
expected: 404 — next-intl pathnames are locale-specific; the vi slug must not resolve under `/en`

**[origin: ui] Language switcher preserves current page**
precondition: on any public page, e.g. `/vi/showroom`
steps: Click `LangSwitcher` (VI/EN pill) to switch to English
expected: Navigates to the equivalent localized route (`/en/showrooms`), not back to home; URL slug changes per-locale, not just locale segment

**[origin: docs] Bilingual fallback — empty English content shows Vietnamese**
precondition: a CMS entity has `en` description populated as empty string
steps: View that entity's detail on `/en/...` route
expected: Vietnamese text is shown as fallback (per `techstack.md` "Data & i18n": "Empty `en` → show `vi`")

**[origin: ui] Admin routes have no locale prefix**
precondition: none
steps: Navigate to `/admin` and `/admin/login`
expected: Loads without `/vi` or `/en` prefix (admin is locale-neutral per README route table and `middleware.ts` matcher)

---

## 2. Home page (`/vi`, `/en`)

Source: `web/src/app/[locale]/page.tsx`, `web/src/components/home/*`,
`docs/frontend-architecture.md` §3, §7, §8

**[origin: ui] Happy path — full home page render**
precondition: seeded data (hero slides, published models, service blocks, news, showrooms, hotlines) exists
steps: Navigate to `/vi`
expected: Renders in order: HeroCarousel → BenefitStrip → ModelGridSection (Personal/Commercial segments) → CtaBand → PromoSection (if promo configured) → DeliveryGallery → NewsTeaser → LeadFormBand (consult form)

**[origin: docs] Hero carousel — empty state**
precondition: 0 hero slides configured in CMS
steps: Navigate to `/vi`
expected: Static navy hero renders using site-default headline from `messages/vi.json` (`heroTitle`/`heroSubtitle`); no dots/arrows shown (per States Matrix §7 in frontend-architecture.md)

**[origin: ui] Hero carousel — single slide**
precondition: exactly 1 hero slide
steps: Navigate to `/vi`
expected: Slide 1 renders SSR; carousel dots are hidden (only shown for >1 slide, per architecture doc §7)

**[origin: ui] Hero carousel — auto-advance and pause on hover**
precondition: ≥2 hero slides
steps: Load home page, observe for 5s+ without interacting; then hover over hero
expected: Slides auto-advance ~5s apart; auto-advance pauses while hovered/focused (per `frontend-architecture.md` §3 HeroCarousel notes)

**[origin: docs] Hero carousel — reduced motion respected**
precondition: OS/browser `prefers-reduced-motion: reduce` enabled
steps: Load home page with reduced-motion active
expected: Carousel auto-advance is disabled (static first slide); no parallax/animation (per §2.5 Motion)

**[origin: ui] Model grid — segment with 0 models is hidden**
precondition: 0 published models with `segment: commercial`
steps: Navigate to `/vi`
expected: "Xe dịch vụ / thương mại" segment block is hidden; "Xe cá nhân" segment still renders if it has models (per States Matrix)

**[origin: ui] Model grid — both segments empty**
precondition: 0 published models at all
steps: Navigate to `/vi`
expected: Entire ModelGridSection is hidden (not an empty grid placeholder) per States Matrix §7

**[origin: ui] Model card price fallback**
precondition: a published model has no variant with a non-null price
steps: View that model's card on home grid
expected: Card shows "Liên hệ" (vi) / contact label (en) instead of a price, via `PriceText` fallback (`contactLabel` prop, default "Liên hệ")

**[origin: docs] Promo countdown — endsAt null**
precondition: `settings.promoCountdown.endsAt` is null but bullets are configured
steps: Navigate to `/vi`
expected: PromoSection renders bullets and date-range note but hides the `CountdownTimer` (per States Matrix: "endsAt null → bullets only, no timer")

**[origin: ui] Promo countdown — expired**
precondition: `endsAt` is a past ISO timestamp
steps: Navigate to `/vi`
expected: `CountdownTimer` renders nothing (component returns `null`/fallback when `expired`); PromoSection is expected to still show the date-range note per docs, but the component itself has no visual timer

**[origin: ui] News teaser — empty state**
precondition: 0 published news posts
steps: Navigate to `/vi`
expected: NewsTeaser section is hidden entirely (per States Matrix: "0 posts → hide section")

**[origin: ui] News teaser — max 3 items**
precondition: >3 published news posts
steps: Navigate to `/vi`
expected: Exactly 3 most-recent news teaser cards render (`getFeaturedNews(3)`)

**[origin: ui] Home consult lead form present and functional**
precondition: none
steps: Scroll to bottom LeadFormBand
expected: `LeadForm` with `preset="consult"` renders — only Họ tên, Số điện thoại, Dòng xe (optional select), consent checkbox; no province/showroom/date/note fields (per Lead form matrix, §5 of frontend-architecture.md)

---

## 3. Header / navigation / mobile nav

Source: `web/src/components/layout/SiteHeader.tsx`,
`web/src/components/layout/MobileNav.tsx`,
`web/src/components/layout/MobileChromeControls.tsx`

**[origin: ui] Desktop header — full chrome**
precondition: viewport ≥900px
steps: Load any public page
expected: Sticky header with logo, desktop nav (`HeaderNav`), `LangSwitcher`, Zalo button (if `zaloUrl` set), hotline CTA button (if `hotline.tel` set)

**[origin: ui] Header CTA buttons conditional render**
precondition: site settings have no Zalo URL and no hotline configured
steps: Load home page
expected: Zalo button and hotline button are both absent (both are conditionally rendered `{zaloUrl ? ... : null}` / `{hotline.tel ? ... : null}`) — no broken empty buttons

**[origin: ui] Mobile nav — opens as modal drawer**
precondition: viewport ≤900px (mobile breakpoint)
steps: Tap hamburger menu icon
expected: `MobileNav` opens as `role="dialog"` `aria-modal="true"`; body scroll is locked (`overflow: hidden`); focus moves to the close button

**[origin: ui] Mobile nav — Escape key closes**
precondition: mobile nav open
steps: Press `Escape`
expected: Drawer closes, `onClose` fires

**[origin: ui] Mobile nav — focus trap (Tab cycling)**
precondition: mobile nav open
steps: Tab through all focusable elements to the last one, press Tab again; then Shift+Tab from the first element
expected: Focus wraps from last→first and first→last within the panel (focus trap implemented in `onKeyDown`)

**[origin: ui] Mobile nav — link click closes drawer**
precondition: mobile nav open
steps: Click any nav item link
expected: Drawer closes (`onClose` called) and navigation proceeds to the target route

**[origin: ui] Mobile nav — empty nav array**
precondition: 0 menu items configured for `HEADER` position
steps: Open mobile nav
expected: Drawer opens with empty `<ul>` list (no crash); Zalo/hotline action buttons still render if configured — this is a defensive/edge case not explicitly covered by docs

**[origin: docs] Header nav sourced from admin-managed menu items**
precondition: admin has configured menu items via `/admin/navigation`
steps: Compare header nav items to `/admin/navigation` menu item list
expected: Header desktop + mobile nav reflect `getMenuItems("HEADER")` — order and labels match admin config (per `project-context.md` §5)

---

## 4. Footer

Source: `web/src/components/layout/SiteFooter.tsx`,
`docs/frontend-architecture.md` §3 SiteFooter row, §1.5/§1.7 project-context.md

**[origin: docs] Footer legal/trust block present**
precondition: site settings configured with legal entity, MST, HQ address
steps: Scroll to footer on any page
expected: Navy 4-col footer shows brand+desc+socials+legal (company name, MST tax code, HQ address) — required Vietnamese-market trust signal per `project-context.md` §1.7

**[origin: ui] Footer showroom directory — max 3 branches shown**
precondition: >3 showrooms seeded
steps: View footer showroom directory column
expected: Shows a subset (design intent: 3 branches) each with type chip (1S/2S/3S) and `tel:` hotline link

**[origin: ui] Footer quick links sourced from FOOTER menu position**
precondition: menu items configured with `position: FOOTER`
steps: Compare footer quick-links column to `/admin/navigation`
expected: Matches `getMenuItems("FOOTER")` output

**[origin: ui] Footer responsive column collapse**
precondition: none
steps: Resize viewport to ≤640px, then 641–899px, then ≥900px
expected: Footer collapses to 1 col ≤640px, 2 cols 641–899px, 4 cols ≥900px (per §2.4 Breakpoints)

---

## 5. Floating contact cluster / mobile action bar

Source: `web/src/components/layout/FloatingContactCluster.tsx`,
`web/src/components/layout/MobileActionBar.tsx`

**[origin: ui] Floating cluster — desktop only**
precondition: viewport >900px
steps: Load any public page
expected: Fixed bottom-right pulsing call FAB + Zalo FAB visible; back-to-top button hidden until scrolled past 1 viewport height

**[origin: ui] Floating cluster hidden on mobile in favor of action bar**
precondition: viewport ≤900px
steps: Load any public page
expected: `FloatingContactCluster` is hidden; `MobileActionBar` (pinned bottom, 3 actions: Gọi · Zalo · Lái thử) is shown instead (per §3 architecture doc)

**[origin: docs] Mobile action bar — safe-area / CLS reservation**
precondition: mobile viewport
steps: Load any public page and check body bottom padding
expected: Body reserves `padding-bottom: var(--bottombar-h)` (64px) so content isn't obscured by the fixed bar — no layout shift on load

**[origin: ui] Back-to-top button appears after scroll threshold**
precondition: desktop viewport, page with enough content to scroll >1 viewport
steps: Scroll down past one viewport height
expected: Back-to-top button fades/appears in the floating cluster; clicking it scrolls to top

---

## 6. Model detail page (`/vi/models/[slug]`, `/en/models/[slug]`)

Source: `web/src/app/[locale]/models/[slug]/page.tsx`,
`web/src/components/models/*`

**[origin: ui] Happy path — full model detail render**
precondition: a published model with variants, feature sections, spec attributes, FAQs, related models exists
steps: Navigate to `/vi/models/<valid-slug>`
expected: Breadcrumb → GalleryHero + VariantSelector (hero grid) → FeatureSections → SpecStrip → RelatedModels (≤3) → ModelFaqs, all render with real data

**[origin: docs] Model not found → 404**
precondition: slug does not match any model, or model is unpublished
steps: Navigate to `/vi/models/does-not-exist`
expected: `notFound()` triggers — Next.js 404 page (per States Matrix: "model not published/found → `notFound()` 404")

**[origin: ui] Gallery — thumbnail selection changes main image**
precondition: model has ≥2 gallery thumbs
steps: Click the 2nd thumbnail in `GalleryHero`
expected: Main image updates to the 2nd thumb's URL; `aria-selected` moves to the clicked thumb button

**[origin: ui] Gallery — keyboard navigation across thumbnails**
precondition: model has ≥3 thumbs, focus on a thumb button
steps: Press ArrowRight, ArrowLeft, Home, End
expected: Focus/selection moves to next/previous/first/last thumb respectively (wrap-around on ArrowRight from last, ArrowLeft from first)

**[origin: ui] Color swatch selection updates main image**
precondition: model has ≥1 color swatch with `imageUrl` mapped
steps: Click a color swatch button
expected: Main image switches to the swatch's mapped image; swatch with no `imageUrl` mapped does nothing when clicked (no-op, per `selectSwatch` guard)

**[origin: ui] Variant selector — switching variant updates price and CTAs**
precondition: model has ≥2 variants, one default
steps: Click a non-default `VariantCard`
expected: Selection moves (radiogroup `aria-label` behavior); displayed `PriceText` updates to selected variant's price (or falls back to `model.priceFromVnd`); Test-drive/Deposit CTA hrefs update to include `?model=<id>&variant=<id>` query when that variant allows it

**[origin: ui] Variant that disallows test drive/deposit**
precondition: a variant has `allowsTestDrive: false` (or `allowsDeposit: false`)
steps: Select that variant, inspect the CTA href
expected: The corresponding CTA href omits the `variant` param and falls back to `?model=<id>` only (per `VariantSelector.tsx` `hrefs` memo logic) — CTA button still renders (not hidden), just links generically

**[origin: docs] Spec strip — hidden when <1 attributes**
precondition: model has 0 spec attributes
steps: View model detail
expected: SpecStrip band is hidden entirely (per States Matrix)

**[origin: docs] Spec strip — unknown attribute key never crashes**
precondition: an attribute has a `key` with no corresponding `spec.*` message entry
steps: View model detail for that model
expected: Cell falls back to displaying the raw key instead of throwing (per States Matrix: "unknown `spec.*` key → fall back to raw key"); page must not 500

**[origin: ui] Price fallback for null-priced variant**
precondition: selected variant has `priceVnd: null`
steps: View price display for that variant
expected: Shows "Liên hệ" fallback text, not "null" or "₫0" (per States Matrix)

---

## 7. Lead capture forms (`LeadForm` — consult / test_drive / deposit presets)

Source: `web/src/components/leads/LeadForm.tsx`,
`web/src/server/modules/leads/leads.schema.ts`, `web/src/server/rate-limit.ts`,
`web/src/app/api/leads/route.ts`, `docs/frontend-architecture.md` §5

This is the site's primary KPI surface (`project-context.md` §1.5) — covered in depth.

**[origin: docs] Field matrix — consult preset**
precondition: home page consult form
steps: Inspect rendered fields
expected: Only Họ tên*, Số điện thoại*, Dòng xe (optional select, label "Dòng xe quan tâm"), consent checkbox*. No province/showroom/date/note fields. Submit label = "Nhận tư vấn miễn phí" (per Lead form matrix table)

**[origin: docs] Field matrix — test_drive preset**
precondition: `/vi/dang-ky-lai-thu` page
steps: Inspect rendered fields
expected: Họ tên*, Số điện thoại*, Tỉnh/Thành select, Showroom select, Dòng xe select, Ngày mong muốn (date), Ghi chú (textarea), consent*. Submit label = "Đăng ký lái thử". Caption below submit: "Sau khi gửi, chúng tôi gọi xác nhận trong 5 phút (8:00–20:00)"

**[origin: docs] Field matrix — deposit preset**
precondition: `/vi/dat-coc` page
steps: Inspect rendered fields
expected: Họ tên*, Số điện thoại*, Dòng xe select (preselected if navigated from a model page), Ghi chú (textarea), consent*. No province/showroom/date fields. Submit label = "Đặt cọc / Tư vấn"

**[origin: ui] Submit button disabled until consent is checked**
precondition: any preset, fresh form
steps: Fill Họ tên and Số điện thoại with valid values but leave consent unchecked
expected: Submit button remains `disabled` (per `disabled={submitting || !consent}`) — cannot be clicked or triggered via Enter key; no request is sent

**[origin: ui] Full-name validation — too short**
precondition: any preset
steps: Type a single character into Họ tên, then blur the field
expected: Inline error appears under the field on blur (validation fires on blur, not just submit); error text = `forms.errors.fullName` message; `aria-invalid="true"` and `aria-describedby` wired to the error `<p>`

**[origin: ui] Full-name validation clears on edit**
precondition: fullName field currently showing an error
steps: Type another character into the field
expected: Error clears immediately on change (`clearFieldError` fires in `onChange`), even before the corrected value is validated

**[origin: ui] Phone validation — invalid format**
precondition: any preset
steps: Enter `12345` into Số điện thoại, blur
expected: Inline error shown; regex `/^(0|\+84)\d{9}$/` fails for this input → invalid

**[origin: ui] Phone validation — valid formats accepted**
precondition: any preset, consent checked, valid name entered
steps: Enter `0912345678`, then separately test `+84912345678`, then `0912 345 678` (with spaces)
expected: All three pass validation — spaces are stripped before regex test (`stripPhone`); no error shown; whitespace-containing input is normalized before submit

**[origin: ui] Phone validation — wrong country/format rejected**
precondition: any preset
steps: Enter `1912345678` (doesn't start with 0 or +84), blur
expected: Inline error shown, submit blocked

**[origin: ui] Preferred date — cannot select past date (test_drive only)**
precondition: `/vi/dang-ky-lai-thu`, date input has `min={todayIso()}`
steps: Attempt to pick a date before today via the native date picker
expected: Native browser date input prevents selecting a date before `min`; if a past date is somehow set (e.g. programmatically) and the form is submitted, inline validation error `errors.preferredDate` fires

**[origin: ui] Preferred date — today is valid**
precondition: `/vi/dang-ky-lai-thu`
steps: Select today's date as preferred date, fill required fields, check consent, submit
expected: No date validation error (comparison is `v < todayIso()`, so equal-to-today passes)

**[origin: ui] Happy path submit — success state**
precondition: valid name, valid phone, consent checked; backend reachable
steps: Fill required fields, check consent, click submit
expected: Button shows loading spinner + disabled during submit (`aria-busy`); on 201 response, form is replaced by a green success card (`role="status"`) with title "Đăng ký thành công!" and body referencing the hotline; the form itself is hidden (per States Matrix: "success card, form hidden")

**[origin: docs] Network/5xx error — inline alert + hotline fallback, values preserved**
precondition: valid form data; simulate 500 response or network failure
steps: Submit form under simulated server error
expected: Inline `role="alert"` message shown with a clickable hotline `tel:` link fallback; entered field values are **not cleared** (per explicit "Never clear entered values on error" comment in source and doc §5)

**[origin: docs] Rate limit — 429 after burst**
precondition: `checkLeadRateLimit` token bucket: capacity 5, refill ~1 token/12s (5/min)
steps: Submit the lead form 6 times in rapid succession from the same IP within a short window
expected: First 5 succeed (201); 6th returns 429 with `Retry-After` header; UI shows the specific "Bạn thao tác quá nhanh…" retry message (`forms.errors.rateLimited`), distinct from the generic server-error message

**[origin: docs] Consent link opens Privacy Policy**
precondition: any preset
steps: Click "Chính sách bảo mật" link inside the consent label
expected: Navigates to the localized `/policies` route (`/vi/chinh-sach` or `/en/policies`), not a dead link

**[origin: ui] Model preselect from query param (deposit/test_drive from model page)**
precondition: navigate from a model detail page's "Đặt cọc" or "Lái thử" CTA which appends `?model=<id>` (and `?variant=<id>` when allowed)
steps: Click "Đặt cọc / Tư vấn" CTA on a model page, land on `/vi/dat-coc?model=<id>`
expected: The Dòng xe select is preselected to that model (`defaultModelId` prop wired from query param)

**[origin: ui] Showroom preselect from query param (test_drive)**
precondition: navigate to `/vi/dang-ky-lai-thu?showroom=<id>` (e.g. from a `ShowroomCard` "Đăng ký" CTA)
expected: Showroom select is preselected to that showroom (`defaultShowroomId`)

**[origin: docs] Backend schema mismatch is caught client-side before network call**
precondition: contrived state where client validation passes but `CreateLeadInputSchema.safeParse` fails (e.g., future schema drift)
steps: Submit with data that fails Zod parse
expected: Generic error message (`errors.generic`) shown without a network request being made — client re-validates against the same schema before POSTing

---

## 8. Test drive page (`/vi/dang-ky-lai-thu`, `/en/book-test-drive`)

Source: `docs/frontend-architecture.md` §8 route map, `docs/reference-site-layouts.md`

**[origin: docs] Data fetch — models list, showrooms, settings**
precondition: none
steps: Navigate to test-drive page
expected: Dòng xe select and Showroom select are populated from live model/showroom lists (not hardcoded); hotline in trust panel matches site settings

**[origin: docs] Layout — form stacks above trust panel on narrow viewport**
precondition: viewport ≤900px
steps: Load test-drive page at ≤900px width
expected: Lead form stacks above the trust/reassurance panel (per §2.4 Breakpoints: "Test Drive: form stacks above trust panel ≤900")

**[origin: ui] Direct navigation without query params**
precondition: none
steps: Navigate to `/vi/dang-ky-lai-thu` directly (no `?model=`/`?showroom=`)
expected: Form loads with all selects at their empty/placeholder option ("-- Chọn --" or similar); no console errors from undefined defaults

**[origin: ui] Empty showrooms list**
precondition: 0 showrooms seeded
steps: Load test-drive page
expected: Showroom select renders with only the placeholder option, no crash (defensive per mapper "null-safe, never throws on partial CMS content")

---

## 9. Deposit page (`/vi/dat-coc`, `/en/deposit`)

**[origin: docs] Data fetch — models + settings only**
precondition: none
steps: Navigate to deposit page
expected: Fetches `models`, `settings` only (per route map) — no showroom/province selects present, consistent with the deposit preset field matrix

**[origin: ui] Deposit form omits test-drive-only fields**
precondition: none
steps: Inspect rendered form
expected: No Tỉnh/Thành, Showroom, or Ngày mong muốn fields; Ghi chú textarea present (deposit preset includes note per matrix)

---

## 10. Showrooms page (`/vi/showroom`, `/en/showrooms`)

Source: `web/src/components/showrooms/ShowroomDirectory.tsx`

**[origin: ui] Happy path — tab filter by city**
precondition: showrooms exist across ≥2 cities (e.g. HCM, Bình Dương)
steps: Navigate to showrooms page, click the "TP.HCM" tab
expected: Grid filters to only HCM showrooms (others get `aria-hidden`/hidden class, not removed from DOM); tab `aria-selected` updates; count in tab label matches (e.g. "TP.HCM (3)")

**[origin: ui] "All" tab shows full count**
precondition: as above
steps: Click "Tất cả" tab
expected: All showrooms visible; count matches total

**[origin: ui] Tab keyboard navigation**
precondition: focus on a tab
steps: Press ArrowRight, ArrowLeft, Home, End
expected: Focus and selection move to next/prev/first/last tab respectively, with wraparound; matches `role="tablist"`/`role="tab"` ARIA pattern

**[origin: docs] Empty state — 0 showrooms**
precondition: 0 showrooms seeded
steps: Navigate to showrooms page
expected: Tabs are hidden entirely (`showrooms.length > 0` guard); "Chưa có showroom" muted empty message shown (per States Matrix)

**[origin: ui] Empty state — filtered tab has 0 results**
precondition: showrooms exist in HCM only; click a city tab with 0 matches (edge case if city key exists with stale count but no matching cards after data change)
steps: Select a tab whose `visibleCount` computes to 0
expected: Empty message (`labels.empty`) renders with `role="status"`

**[origin: ui] ShowroomCard — hotline click-to-call**
precondition: showroom has a hotline
steps: Inspect the showroom card's hotline link
expected: `tel:` href present and normalized (per `ShowroomVM.hotline` contract), so tapping on mobile initiates a call

**[origin: ui] ShowroomCard — "Chỉ đường" opens Maps**
precondition: showroom has lat/lng or address
steps: Click "Chỉ đường"
expected: Opens a Google Maps deep-link (`mapsUrl`) in a new context; link is non-empty even for showrooms without lat/lng (address-based fallback per `ShowroomVM` contract comment)

---

## 11. News (`/vi/tin-tuc`, `/vi/tin-tuc/[slug]`)

**[origin: docs] News list — published posts only**
precondition: mix of published/unpublished news posts
steps: Navigate to news list page
expected: Only published posts are listed

**[origin: ui] News detail — invalid slug → 404**
precondition: none
steps: Navigate to `/vi/tin-tuc/does-not-exist`
expected: 404 page (consistent with model-detail `notFound()` pattern)

**[origin: ui] News list — empty state**
precondition: 0 published news posts
steps: Navigate to `/vi/tin-tuc`
expected: Page renders without crashing; shows an empty-state message rather than a broken/empty grid (inferred from consistent States Matrix pattern used elsewhere; unverified for this specific page — flag if it differs)

**[origin: ui] News detail — locale-correct slug**
precondition: a news post has distinct `vi`/`en` slugs
steps: Navigate to the `en` slug under `/en/news/[slug]` and to the `vi` slug under `/vi/tin-tuc/[slug]`
expected: Both resolve to the same underlying post with locale-correct copy; cross-locale slug (vi slug under `/en`) 404s

---

## 12. Static informational pages — About / Contact / Policies / Support

**[origin: docs] About page — dealer identity content**
precondition: site settings + brand story content configured
steps: Navigate to `/vi/ve-chung-toi`
expected: Renders admin-managed brand story content (not VinFast reference copy per Brand/asset replacement discipline, `project-context.md` §6)

**[origin: docs] Contact page — hotlines and showroom directory**
precondition: hotlines + showrooms configured
steps: Navigate to `/vi/lien-he`
expected: Displays hotlines, email, showroom list — consistent trust signals per §1.7

**[origin: docs] Policies page — consent link target exists and loads**
precondition: policy content + optional policy PDFs configured
steps: Navigate to `/vi/chinh-sach` (this is the target of the `ConsentCheckbox` privacy link)
expected: Page loads successfully with policy content; PDFs (if any) are downloadable/linked

**[origin: ui] Support/FAQ page**
precondition: FAQ content configured in admin
steps: Navigate to `/vi/ho-tro`
expected: FAQ items render as native `<details>/<summary>` disclosures (`FaqItem` component, no JS required to expand/collapse)

---

## 13. SEO, sitemap, robots, public API — cross-cutting

Source: `web/src/app/sitemap.ts`, `web/src/app/robots.ts`,
`web/src/app/api/health/route.ts`, `web/src/app/api/models/[slug]/route.ts`,
`docs/implementation-plan.md` Phase 5, `docs/deploy-checklist.md` §5

**[origin: docs] Health check endpoint**
precondition: app + DB reachable
steps: `GET /api/health`
expected: 200 response (per deploy-checklist verification step)

**[origin: docs] Sitemap lists both locales**
precondition: published models/pages exist
steps: `GET /sitemap.xml`
expected: Lists both `/vi/*` and `/en/*` URLs (per deploy-checklist §5 and implementation-plan Phase 5.3)

**[origin: docs] hreflang + canonical present**
precondition: any public page
steps: Inspect `<head>` of `/vi/models/<slug>` and `/en/models/<slug>`
expected: `hreflang` alternate links point to each other; canonical URL matches the current locale/slug (Phase 5.2)

**[origin: docs] Public model API contract**
precondition: valid published model slug
steps: `GET /api/models/[slug]?locale=vi`
expected: Response is exactly `{ units, attributes }` — no `label`/`display` fields from server (per `techstack.md` "Model API returns **exactly** `{ units, attributes }`")

**[origin: ui] Public model API — unknown slug**
precondition: none
steps: `GET /api/models/does-not-exist?locale=vi`
expected: Non-200 error response (404 or similar) rather than 500 or empty 200

---

## 14. Admin — Auth & RBAC

Source: `web/src/app/admin/login/page.tsx`, `web/src/server/auth/*`,
`web/src/middleware.ts`

**[origin: ui] Unauthenticated access to admin is redirected**
precondition: no session cookie
steps: Navigate directly to `/admin/settings`
expected: Redirects to `/admin/login?callbackUrl=/admin/settings` (per `middleware.ts` cookie gate)

**[origin: ui] Login — happy path**
precondition: valid seeded admin credentials (e.g. `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`)
steps: Navigate to `/admin/login`, submit valid email/password
expected: Redirects to `/admin`; DB session created (`authjs.session-token` cookie set)

**[origin: ui] Login — invalid credentials**
precondition: none
steps: Submit an unknown email or wrong password
expected: Redirects back to `/admin/login?error=Invalid%20email%20or%20password.` and the error text renders in a `role="alert"` paragraph; no session cookie set

**[origin: ui] Login — empty fields**
precondition: none
steps: Submit the login form with both fields empty
expected: Browser-native `required` validation blocks submission (both inputs have `required`); if bypassed, server returns "Email and password are required."

**[origin: docs] RBAC — SALES role restricted to dashboard + leads**
precondition: logged in as a `SALES` role admin user
steps: Attempt to navigate to `/admin/settings`, `/admin/navigation`, `/admin/models`, `/admin/media`, `/admin/homepage`, `/admin/news`, `/admin/pages`, `/admin/showrooms`, `/admin/units`, `/admin/templates`
expected: Each is denied (per `MODULE_ROLES`, SALES is only in `dashboard` and `leads`) — `guardAdmin`/`requireAdminOrThrow` should block; UI should not render disallowed content or actions should return `UNAUTHORIZED`

**[origin: docs] RBAC — EDITOR role denied settings and navigation**
precondition: logged in as `EDITOR` role
steps: Attempt to access `/admin/settings` and `/admin/navigation`
expected: Denied — these two modules are `SUPER_ADMIN`-only per `MODULE_ROLES`; EDITOR has access to units/templates/models/media/homepage/news/pages/showrooms/leads/dashboard

**[origin: docs] RBAC — SUPER_ADMIN has full access**
precondition: logged in as `SUPER_ADMIN`
steps: Navigate to every module listed in admin nav
expected: All 12 modules accessible (dashboard, settings, navigation, units, templates, models, homepage, news, pages, showrooms, media, leads)

**[origin: ui] Admin nav renders only permitted items per role**
precondition: logged in as `SALES`
steps: Inspect the admin side nav (`AdminNav`)
expected: Only Dashboard and Leads links are shown — nav is filtered via `canAccess`, not just the destination page (per `nav.ts` comment "filtered per role via canAccess")

**[origin: ui] Session revocation takes effect**
precondition: logged-in admin session; session row deleted server-side (simulating "revoke")
steps: With stale cookie still present, navigate to an admin page
expected: Middleware's cookie-presence check alone would let the request through, but `auth()`/`requireAdmin` (Node layer) must reject the stale session and redirect/deny — per `middleware.ts` comment "Cookie presence ≠ valid login"

---

## 15. Admin — Site Settings (`/admin/settings`, SUPER_ADMIN only)

Source: `web/src/app/admin/(panel)/settings/SettingsForm.tsx`

**[origin: ui] Settings form — bilingual fields have VI/EN tabs**
precondition: logged in as SUPER_ADMIN
steps: Navigate to `/admin/settings`
expected: Dealer name, legal entity, copyright, disclaimers, promo label, CTA labels etc. use `LocalizedField` with VI | EN tabs (per `project-context.md` §5 "VN | EN tabs on bilingual fields")

**[origin: ui] Settings — promo countdown toggle**
precondition: none
steps: Toggle `promoEnabled` off, save
expected: Home page PromoSection stops rendering (or renders without countdown) — consistent with the empty/off state

**[origin: ui] Settings — maintenance mode toggle**
precondition: SUPER_ADMIN logged in
steps: Enable `maintenanceMode`, save, then visit a public page as an anonymous visitor
expected: Public site enters maintenance state (per `project-context.md` §5 "maintenance toggle") — exact UI behavior unverified from source at this pass; flag for execution-phase confirmation

**[origin: ui] Settings — save persists and revalidates**
precondition: SUPER_ADMIN logged in
steps: Change dealer name, save, then reload the public home page footer
expected: Updated dealer name appears immediately (writes call `revalidateTag` per `techstack.md` caching rule — no manual cache purge needed)

---

## 16. Admin — Navigation & Hotlines (`/admin/navigation`, SUPER_ADMIN only)

**[origin: ui] Hotlines CRUD**
precondition: SUPER_ADMIN logged in
steps: Add a hotline with `{vi,en}` label and phone number, save
expected: New hotline appears in header/footer hotline CTAs on public site after revalidation

**[origin: ui] Menu items ordering**
precondition: ≥2 menu items exist
steps: Reorder menu items (if drag/order control exists) and save
expected: Public header/footer nav order updates to match

**[origin: docs] Menu item CTA route keys**
precondition: none
steps: Create a menu item pointing to a CTA route key (e.g. test-drive)
expected: Resulting public nav link resolves to the correct localized route for the active locale

---

## 17. Admin — Vehicle catalog (Units, Templates, Models/Variants)

Source: `web/src/app/admin/(panel)/models/*`,
`web/src/app/admin/(panel)/units/*`, `web/src/app/admin/(panel)/templates/*`

**[origin: ui] Units catalog CRUD**
precondition: EDITOR or SUPER_ADMIN logged in
steps: Create a new unit key with `{vi,en}` label at `/admin/units`
expected: Unit is saved and becomes selectable when adding vehicle attributes

**[origin: ui] Attribute templates — apply to a model**
precondition: a template exists with predefined attribute rows
steps: On a model's editor, apply a saved template
expected: Attribute rows `[{key,value,unit}]` are populated from the template (per `project-context.md` §5 "apply / save-as-template")

**[origin: ui] Attribute templates — save-as-template**
precondition: a model has custom attributes configured
steps: Save current attribute set as a new template
expected: New template appears in the templates list, reusable on other models

**[origin: ui] Create new vehicle line/segment/model (happy path)**
precondition: EDITOR/SUPER_ADMIN logged in
steps: Navigate to `/admin/models/new`, fill required bilingual name/slug/tagline/description, save
expected: New model created as a draft (unpublished); appears in `/admin/models` list

**[origin: ui] Model requires unique slug per locale**
precondition: an existing model has vi slug `vf-8`
steps: Attempt to create another model with the same vi slug
expected: Validation error — slug must be unique (inferred requirement for routing to function; verify server-side constraint at execution phase)

**[origin: ui] Variant — price, deposit/test-drive flags**
precondition: model editor open
steps: Add a variant with price, toggle `allowsDeposit`/`allowsTestDrive` off
expected: Public model page's CTA hrefs for that variant fall back to model-only query params (ties to Model-detail case "Variant that disallows test drive/deposit")

**[origin: ui] Unpublished model is not publicly reachable**
precondition: a model exists with `published: false`
steps: Navigate to its public detail URL
expected: 404 (`notFound()`), and it should not appear in `getPublishedModels()` results on home/grid

**[origin: docs] Vehicle line CRUD (Lines manager)**
precondition: SUPER_ADMIN/EDITOR logged in
steps: Navigate to `/admin/models/lines`, create/edit a line
expected: Line available as a grouping option when creating segments/models

---

## 18. Admin — Media library (`/admin/media`)

Source: `web/src/app/admin/(panel)/media/MediaLibrary.tsx`

**[origin: ui] Upload — happy path**
precondition: R2 configured, EDITOR/SUPER_ADMIN logged in
steps: Select a file, choose folder "VEHICLES", optionally fill VI/EN alt text, submit
expected: Button shows "uploading" state (disabled while pending); on success, new asset appears at the top of the visible grid for that folder; success message shown; form resets

**[origin: ui] Upload — file field required**
precondition: none
steps: Submit the upload form with no file selected
expected: Native `required` validation blocks submission (file input has `required`)

**[origin: ui] Upload — R2 not configured**
precondition: `STORAGE_S3_*` env vars missing/invalid
steps: Attempt an upload
expected: Specific error message `r2NotConfigured` shown (distinct from generic error) — per explicit `result.error.code === "R2_NOT_CONFIGURED"` branch

**[origin: ui] Folder filter tabs**
precondition: assets exist across multiple folders
steps: Click each folder button (VEHICLES/HEROES/NEWS/POLICIES/SITE)
expected: Grid filters to only that folder's assets; each button shows a live count; `aria-pressed` reflects the active folder

**[origin: ui] Empty folder state**
precondition: a folder (e.g. POLICIES) has 0 assets
steps: Click that folder's filter tab
expected: "emptyFolder" message shown instead of an empty grid

**[origin: ui] Delete asset — confirmation required**
precondition: at least 1 asset exists
steps: Click delete on an asset card
expected: `ConfirmDelete` confirmation UI appears before the delete actually fires; confirming removes the asset from the grid and shows a success message; canceling leaves the asset intact

---

## 19. Admin — Homepage / News / Pages CMS

Source: `web/src/app/admin/(panel)/homepage/*`,
`web/src/app/admin/(panel)/news/*`, `web/src/app/admin/(panel)/pages/*`

**[origin: ui] Homepage — hero slide CRUD**
precondition: EDITOR/SUPER_ADMIN logged in
steps: Add a new hero slide with title/subtitle/image/CTA, save
expected: Slide appears on public home hero carousel after revalidation, respecting slide order

**[origin: ui] Homepage — service block CRUD**
precondition: as above
steps: Edit an existing service/benefit block's bilingual title+description
expected: Public `BenefitStrip` reflects the change

**[origin: ui] News — bilingual post CRUD with per-locale slug**
precondition: as above
steps: Create a news post with distinct vi/en slugs and content, publish
expected: Post is reachable at both `/vi/tin-tuc/<vi-slug>` and `/en/news/<en-slug>`

**[origin: ui] Pages — FAQ section CRUD**
precondition: as above
steps: Add a new FAQ Q&A pair via `FaqSection`
expected: New FAQ item appears on the public support/FAQ page as a `<details>` disclosure

---

## 20. Admin — Leads inbox (`/admin/leads`)

Source: `web/src/app/admin/(panel)/leads/page.tsx`,
`web/src/app/admin/(panel)/leads/actions.ts`

**[origin: ui] Leads list — happy path**
precondition: SUPER_ADMIN/EDITOR/SALES logged in; ≥1 lead exists (e.g. from a public form submission)
steps: Navigate to `/admin/leads`
expected: List renders lead id, type, and submitted name for up to 50 leads (`listLeads({ take: 50 })`)

**[origin: ui] Leads list — empty state**
precondition: 0 leads in DB
steps: Navigate to `/admin/leads`
expected: Empty `<ul data-testid="leads-list">` renders without error (current minimal implementation has no explicit "no leads yet" message — flag as a UX gap, not a docs contradiction, since project-context.md just says "Leads inbox" without specifying empty-state copy)

**[origin: docs] Status transitions new→contacted→closed**
precondition: a lead exists with status `NEW`
steps: Update status via `updateLeadStatusAction` to `CONTACTED`, then `CLOSED`
expected: Status transitions succeed in that order (per `project-context.md` §5 "status new→contacted→closed"); UI for this transition is not present in the current minimal `page.tsx` — action exists (`updateLeadStatusAction`) but no visible control was found in the leads page source; flag as a **gap** (see Findings)

**[origin: docs] CSV export**
precondition: leads exist
steps: Trigger `exportLeadsCsvAction`
expected: CSV output has header exactly matching `LEAD_CSV_COLUMNS`: `id,type,status,locale,name,phone,email,model,variant,showroom,createdAt`

**[origin: docs] Leads filter (docs-specified, not found in current source)**
precondition: leads of multiple types/statuses exist
steps: Attempt to filter leads by type/status in `/admin/leads`
expected: `project-context.md` §5 states "filter, CSV export" as expected leads-inbox capability; current `page.tsx` has no filter UI — flag as a **docs-vs-source gap** (see Findings)

**[origin: docs] Lead created via public form is visible in admin inbox**
precondition: none
steps: Submit a test-drive lead on the public site, then check `/admin/leads`
expected: New lead appears in the admin list shortly after submission (per deploy-checklist §5: "Test-drive form creates lead in `/admin/leads`") — end-to-end integration case, high priority for execution phase

---

## 21. Accessibility & responsive — cross-cutting

Source: `docs/frontend-architecture.md` §7 "A11y baseline"

**[origin: docs] Semantic landmarks on every page**
precondition: none
steps: Inspect DOM structure of any public page
expected: `header`, `nav`, `main`, `footer` landmarks present; exactly one `h1` per page

**[origin: docs] Focus-visible rings**
precondition: none
steps: Tab through interactive elements (nav links, buttons, form fields)
expected: Visible focus ring (brand-500, 2px) on each focused element

**[origin: docs] Form fields — aria-invalid / aria-describedby wiring**
precondition: any lead form with a triggered field error
steps: Inspect the invalid input's attributes
expected: `aria-invalid="true"` and `aria-describedby` pointing to the error `<p id="...-error">` (verified in source: `formControlA11y` helper)

**[origin: docs] Icon-only buttons have aria-label**
precondition: none
steps: Inspect icon-only buttons (menu hamburger, close, gallery thumbs, color swatches)
expected: Each has `aria-label` (verified in `MobileNav` close button, `GalleryHero` swatches)

**[origin: ui] Responsive grid breakpoints — model grid**
precondition: ≥6 published models
steps: Resize viewport to ≤640px, 641–1199px, ≥1200px
expected: 1 col / 2 cols / 3 cols respectively (per §2.4 Breakpoints)

**[origin: docs] Color contrast — accent-500 large-text-only rule**
precondition: any page using `--color-accent-500` for price text
steps: Inspect price text font-size/weight
expected: `--color-accent-500` (#E8481F, 3.9:1 contrast) used only for ≥22px bold text per token sheet; never for small body text (would fail WCAG AA otherwise)

---

## Findings — docs-vs-source gaps

1. **README.md is stale relative to the TypeScript rework.** It states
   `Language: JavaScript` and lists env vars `SESSION_SECRET`,
   `ADMIN_EMAIL`/`ADMIN_PASSWORD`, and "Cache: In-memory only (no Redis)".
   The authoritative `docs/techstack.md` (and the actual `.ts`/`.tsx` source
   tree) specify **TypeScript strict**, `AUTH_SECRET`, `SEED_ADMIN_EMAIL`/
   `SEED_ADMIN_PASSWORD`, and a tag-based `revalidateTag`-only caching
   strategy with **no in-memory Map cache**. `docs/implementation-plan.md`
   explicitly says to "Ignore archived 'no TypeScript / Redis / HMAC cookie'
   v1 language" — README was not updated to match. Recommend updating
   README before it misleads new contributors or is used for onboarding.

2. **`docs/deploy-checklist.md` §2 required-vars table lists `SESSION_SECRET`**
   instead of `AUTH_SECRET` (which `techstack.md` and the source
   `env.ts` Zod schema actually require). Same stale-doc pattern as (1).

3. **README's admin modules table omits `/admin/units`.** The route exists
   in source (`nav.ts` includes a `units` module, gated to `SUPER_ADMIN`/
   `EDITOR`) and is part of the vehicle-catalog admin spec in
   `project-context.md` §5 ("Attributes — units catalog..."), but README's
   admin route table does not list it.

4. **`docs/project-context.md` §5 specifies leads-inbox "filter, CSV export"**
   as expected capability. The current `web/src/app/admin/(panel)/leads/page.tsx`
   is explicitly commented as a "Minimal unstyled leads list — proves leads
   service after POST /api/leads" with no visible filter UI and no visible
   status-update or CSV-export controls, even though the underlying Server
   Actions (`updateLeadStatusAction`, `exportLeadsCsvAction`) exist. This is
   a genuine **UI-not-yet-built** gap versus the documented admin spec —
   worth flagging to the team as either a known-incomplete area or a
   documentation-ahead-of-implementation situation. `implementation-plan.md`
   Phase 3.3 marks Leads backend "✓" but Phase 3 admin UI note says "full
   CMS UI is frontend-owned" — consistent with this being a known stub.

5. **`docs/frontend-architecture.md` §8 route/data-fetch table is incomplete.**
   It documents Home, Model detail, Test drive, Deposit, and Showrooms, but
   omits `/news`, `/news/[slug]`, `/about`, `/contact`, `/policies`, and
   `/support` even though all of these exist as real routes in
   `web/src/app/[locale]/` and in `routing.ts`. Not a contradiction, just an
   incomplete architecture doc — low-risk gap since the routes are otherwise
   well documented in `implementation-plan.md`'s route map and README.

6. **Settings "maintenance toggle" behavior is undocumented in source-readable
   form.** `project-context.md` §5 mentions a "maintenance toggle" as part of
   Site Settings, and `SettingsForm.tsx` has a `maintenanceMode: boolean`
   field, but the actual public-site behavior when enabled (full-site
   maintenance page? banner? blocked routes?) was not located in the parts of
   `middleware.ts` / `layout.tsx` read during this pass. Recommend explicit
   verification during execution phase.

---

## Suite summary

| Feature area | Cases |
|---|---|
| 1. Global i18n/routing | 7 |
| 2. Home page | 12 |
| 3. Header/nav/mobile nav | 8 |
| 4. Footer | 4 |
| 5. Floating contact / mobile action bar | 4 |
| 6. Model detail page | 10 |
| 7. Lead capture forms | 17 |
| 8. Test drive page | 4 |
| 9. Deposit page | 2 |
| 10. Showrooms page | 7 |
| 11. News | 4 |
| 12. Static pages (About/Contact/Policies/Support) | 4 |
| 13. SEO/sitemap/robots/API | 5 |
| 14. Admin auth & RBAC | 9 |
| 15. Admin settings | 4 |
| 16. Admin navigation/hotlines | 3 |
| 17. Admin vehicle catalog | 8 |
| 18. Admin media library | 6 |
| 19. Admin homepage/news/pages CMS | 4 |
| 20. Admin leads inbox | 6 |
| 21. Accessibility & responsive (cross-cutting) | 6 |
| **Total** | **134** |

Origin breakdown: **docs**-derived ≈ 34 cases (citing project-context.md,
frontend-architecture.md, implementation-plan.md, techstack.md,
deploy-checklist.md) · **ui**-derived (from reading `web/src` routes and
components) ≈ 100 cases.

**Execution status: not started.** No live URL was available this run — all
cases above are authored/derived only. Next step: provide a reachable dev/
staging URL plus seeded test data (published models with variants/prices/
attributes, hero slides, showrooms across ≥2 cities, news posts, hotlines)
and admin credentials for each role (`SUPER_ADMIN`, `EDITOR`, `SALES`) to
proceed to the execution phase.
