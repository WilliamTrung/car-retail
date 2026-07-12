# Project Context — car-retail

## Overview

**car-retail** is a bilingual (Vietnamese / English) car dealership marketing website with an admin CMS. It is inspired by VinFast reference sites but uses original branding and admin-managed content.

| Item | Value |
|------|-------|
| Repository | `E:\works\car-retail` |
| Product | Car selling / dealership public site + admin back-office |
| Scope v1 | **Cars only** — catalog, model detail, leads, supporting pages |
| Default locale | `vi` (Vietnamese) |
| Secondary locale | `en` (English) |

## Reference sites (layout / UX only)

| Site | URL | Role |
|------|-----|------|
| OEM | [vinfastauto.com/vn_vi](https://vinfastauto.com/vn_vi) | National brand: spec depth, variant pricing, policies, FAQ |
| Dealer | [vinfastdongsaigon.vn](https://vinfastdongsaigon.vn/) | Local dealer: test-drive CTA, news, multi-showroom footer, hotlines |

**Template decision:** dealer layout as primary; OEM patterns for model detail (spec strip, feature sections, FAQs).

Do **not** copy VinFast HTML, CSS, images, or marketing copy. Use references for structure and UX patterns only.

## Goals

1. Public site for vehicle catalog, model pages, test-drive and deposit lead capture
2. Admin CMS for all dynamic content (vehicles, news, settings, media, leads)
3. Bilingual public experience with localized URLs and per-locale slugs
4. Structured car attributes (key-value) with reusable admin templates

## Out of scope (v1)

- E-bikes, accessories, charging-station locator
- User accounts, payment gateway, full e-commerce checkout
- Used-car inventory, careers, service booking flows
- Redis (use in-memory cache)

## Public features (v1)

### Home
- Hero carousel, vehicle lineup cards (tagline + price-from)
- Service blocks, trade-in promo, news teaser
- Dealer-style footer (showrooms, hotlines, legal entity, MST)

### Model detail
- Variant pricing, spec strip, feature sections, gallery, FAQ
- Test-drive and consult CTAs

### Lead forms
- **Test drive** (primary): model, date, time, contact, consent
- **Deposit / consult** (secondary): model, variant, showroom, contact

### Supporting pages
- News (`/vi/tin-tuc` ↔ `/en/news`)
- About, contact, policies, FAQ

## Internationalization model

Three data tiers:

| Tier | What | Storage |
|------|------|---------|
| 1 — Attributes | `key`, `value`, `unit` only | PostgreSQL; labels in `messages/*.json`; units in DB array |
| 2 — Descriptions | Marketing copy | `{ vi, en }` in DB |
| 3 — Slugs | URL segments per locale | `{ vi, en }` in DB |

English routes use English path segments (e.g. `/en/book-test-drive`, not `/en/dang-ky-lai-thu`).

## Asset replacement checklist

Review before first deploy. VinFast references are **UX only** — never ship their assets or copy.

### Must replace (legal / trademark / brand-bound)

| Asset | VinFast example | Action |
|-------|-----------------|--------|
| Logo | VinFast V wordmark | Upload dealer/OEM logo via admin |
| Dealer brand name | "VinFast Đông Sài Gòn" | Site settings → display name `{ vi, en }` |
| Legal entity | CÔNG TY CỔ PHẦN… | Site settings → legal name `{ vi, en }` |
| Tax ID (MST) | 0316801817 | Site settings |
| Hotlines | 0971 38 90 68, 1900 23 23 89 | Hotlines CRUD |
| Email | info@vinfastdongsaigon.vn | Site settings |
| Model names | VF 3, VF 8, Limo Green | Admin-defined; seed generic placeholders only |
| Campaign slogans | "Mãnh liệt Tinh thần Việt Nam…" | Admin marketing copy |
| Privacy / terms | shop.vinfastauto.com links | Admin-authored legal pages per locale |
| Policy PDFs | VinFast corporate docs | Upload own PDFs to R2 |
| Showroom names | "Đông Sài Gòn 1" | Showrooms CRUD |
| Copyright footer | © Vinfastdongsaigon.vn | Site settings |
| Hero / promo images | VinFast campaign art | R2 upload — own creative |
| Car renders | VF press images | R2 upload per vehicle |
| Ecosystem refs | Vingroup, VinPearl, Xanh SM | Remove or replace |
| Promo footnotes | "(*) Mức giá ưu đãi…" | Admin disclaimer text |

### Keep (generic UI — no replacement needed)

- [ ] Favicon (generic auto icon, not VinFast-branded)
- [ ] UI icons (Lucide/Heroicons — arrows, spec icons)
- [ ] Form controls, layout grid, spacing patterns
- [ ] Countdown timer component (generic)
- [ ] Map pin icons (generic)

### Admin-managed (dynamic — never hardcode)

- [ ] Vehicle images, hero banners, gallery
- [ ] Prices, taglines, specs (attribute values)
- [ ] News posts, FAQ, policies
- [ ] Showroom addresses, hotlines
- [ ] Lead form copy and consent text

### Pre-deploy sign-off

- [ ] No `vinfast` / `VINFAST` in public HTML, meta, or images
- [ ] No links to vinfastauto.com or shop.vinfastauto.com in legal/consent
- [ ] Seed data uses generic model names only
- [ ] All logos and car photos are admin-uploaded or placeholders
- [ ] MST, legal entity, hotlines match real dealer data

---

## Admin feature spec

Route: `/admin` — role-based access. Content fields use **VN | EN** tabs unless noted.

### Auth & users
- Login (email + password), session, password reset
- Roles: **Super Admin** (all), **Editor** (content + vehicles), **Sales** (leads only)

### Site settings
- Dealer name, legal entity, MST, email, copyright — `{ vi, en }`
- Logo + favicon upload (R2)
- Social links, privacy policy URL, consent template, SEO defaults, disclaimers
- Maintenance mode toggle

### Hotlines
- CRUD: label `{ vi, en }`, phone number, sort order, optional showroom link

### Navigation & menus
- Header/footer items: label `{ vi, en }`, internal route key, order, visible
- CTAs: test-drive + deposit — label `{ vi, en }` + route key
- Links resolve to localized paths (`/vi/tin-tuc` ↔ `/en/news`)

### Units catalog
- CRUD `units`: `{ key, value: { vi, en } }` — referenced by `attributes[].unit`
- API returns full `units` array with model responses

### Attribute templates
- CRUD templates: `name { vi, en }`, `key`, `items[]`
- Item fields: `key`, `unit`, `defaultValue`, `showInStrip`, `sortOrder`, `groupKey`
- **Apply template** on model/variant (replace or merge)
- **Save as template** from existing attributes
- Seed: `electric-suv-standard`, `electric-mpv-standard`, `commercial-van`

### Vehicle catalog
- **Lines** (personal/commercial), **segments** — `name { vi, en }`
- **Models** — `name`, `slug`, `tagline`, `description`, meta `{ vi, en }`; hero, gallery (R2)
- **Variants** — `name { vi, en }`, price, flags (deposit, test-drive, published)
- **Attributes** — `[{ key, value, unit }]` only; no locale on values
- **Feature sections**, **model FAQs** — bilingual text + images

### Homepage CMS
- Hero slides, service blocks, brand story, trade-in block, promo countdown

### News / blog
- `title`, `slug`, `excerpt`, `body`, meta — all `{ vi, en }`
- Featured image (R2), publish date, featured flag

### Static pages, policies, FAQ
- Bilingual CRUD with per-locale slugs
- Policy PDFs on R2

### Showrooms
- Name, address, city, phone, hours `{ vi, en }`, type tag (1S/2S/3S), lat/lng

### Leads inbox
- Types: `test_drive`, `deposit`, `consult`
- Fields include `locale`; status: new → contacted → closed
- Filter, export CSV, optional email notify

### Media library (R2)
- Upload/delete; metadata in PostgreSQL (`r2Key`, `publicUrl`, `altText { vi, en }`)
- Folders: `vehicles/`, `heroes/`, `news/`, `policies/`, `site/`

### SEO & publishing
- Per-locale meta, preview, sitemap for `/vi/*` and `/en/*`
- Cache bust via `revalidateTag` on writes

### Admin UX — i18n
- VN | EN tabs on descriptions and slugs
- Single-value editor for attributes (unit dropdown from `units`)
- Flag incomplete English content

### API contract (attributes)
```json
{
  "units": [{ "key": "km", "value": { "vi": "km", "en": "km" } }],
  "attributes": [{ "key": "range", "value": 562, "unit": "km" }]
}
```
No `label` or `display` on server — client joins `messages[locale].spec` + `units`.

## Roles (admin)

| Role | Access |
|------|--------|
| Super Admin | All modules + users |
| Editor | Content + vehicles |
| Sales | Leads inbox only |

## Success criteria (v1)

- [ ] Bilingual public site live on `/vi` and `/en`
- [ ] Admin can CRUD vehicles, templates, units, news, settings, media
- [ ] Leads captured for test-drive and deposit
- [ ] All external services configured via `.env` only
- [ ] Docker Compose runs `app` + `migrate` only
- [ ] No VinFast trademark assets in production

## Related docs

- [techstack.md](./techstack.md) — technology choices
- [implementation-plan.md](./implementation-plan.md) — build phases and tasks

Admin feature spec and asset replacement checklist are **sections in this file** (not separate docs).
