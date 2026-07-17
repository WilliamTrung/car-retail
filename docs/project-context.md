# Project Context — car-retail

> **Purpose of this document:** declare the **business domain** this project targets so that
> research, design, and engineering all share one grounded understanding of *who this is for,
> what business it runs, and what the site must achieve*. The UI researcher uses the
> **Business domain** section below (plus the reference sites) as the frame for competitive research.

---

## 1. Business domain

### 1.1 Industry & market

**car-retail** is the marketing + lead-generation website for an **authorized electric-vehicle (EV)
dealership operating in Vietnam** — the retail tier of the domestic EV market pioneered by VinFast.
The domain is **automotive retail (new cars only)**, EV-first, in a fast-growing emerging market where:

- The **manufacturer (OEM)** owns brand, spec, national pricing, and policy.
- **Local authorized dealers** own the customer relationship: showroom experience, test drives,
  deposits, delivery, after-sales service, and regional promotions.
- Buyers are **mid-transition to EVs** — many are first-time EV owners who need education
  (range, charging, battery lease/subscription, cost-of-ownership) before they commit.

This project builds a **dealer** site (not the OEM site). It uses original branding and
**admin-managed** content; VinFast reference sites inform **UX and information architecture only**.

### 1.2 Business model — the dealer

The dealer is a **multi-showroom "3S" operation**: **S**ales · **S**ervice · **S**pare-parts.
Revenue and the site's job center on **getting qualified buyers into a showroom or a deposit**:

| Dealer function | How the site serves it |
|---|---|
| **Sales** | Vehicle catalog, model/variant education, price-from, test-drive & deposit capture |
| **Service** | Showroom/branch directory, hotlines, service-oriented trust signals |
| **Spare-parts / after-sales** | Trust & credibility content, contact channels |
| **Marketing** | Campaigns, promotions/countdowns, news, trade-in offers |

The dealer runs **several branches** across a metro region (Ho Chi Minh City / Bình Dương corridor),
each with its own address, hours, hotlines, and showroom "type tag" (1S/2S/3S).

### 1.3 Target customers (personas)

1. **First-time EV buyer (primary)** — urban family or young professional, price-sensitive,
   needs reassurance on range/charging/warranty and total cost. Wants to *book a test drive*.
2. **Upgrade/second-car buyer** — comparing variants and promotions; ready to *place a deposit*.
3. **Commercial / fleet inquirer** — small business considering EV vans/commercial line; wants a *consult*.
4. **Existing owner** — returning for service/parts info and branch contact.

### 1.4 Customer journey the site must support

```
Awareness → Model research → Compare variants/price → Test drive (lead) →
Deposit / consult (lead) → Showroom visit → Purchase → After-sales/service
```

The site owns the **top of funnel through lead capture**. Purchase and delivery happen offline at
the showroom (no e-commerce checkout in v1). Every page should push toward one of three conversions:
**test-drive booking**, **deposit/consult**, or **contacting a showroom/hotline**.

### 1.5 Core business goals of the website

1. **Generate qualified leads** — test-drive and deposit/consult forms are the primary KPI.
2. **Educate & build confidence** in EV models (specs, range, features, FAQs, policies).
3. **Project a trustworthy, local, multi-branch dealer identity** (showrooms, hotlines, legal entity, MST).
4. **Run marketing campaigns** (promotions, countdowns, trade-in, news) the dealer edits without a developer.
5. **Serve a bilingual audience** — Vietnamese-first, English secondary — with localized URLs.

### 1.6 Domain entities (the language of this business)

`Vehicle line` (personal / commercial) → `segment` → `model` → `variant` (price, deposit/test-drive
flags) with structured **`attributes` (key · value · unit)**; `showroom` (branch); `hotline`; `lead`
(test_drive / deposit / consult); marketing **content** (hero, promo, news, pages, policies, FAQ);
`media asset`; `site settings` (dealer identity, legal entity, MST). These map directly to the data model.

### 1.7 Market/localization specifics

- **Vietnamese (`vi`) is the default locale**; English (`en`) is secondary with English URL slugs.
- **Pricing in VND** (large integer, no decimals); "price from" framing on cards.
- **Legal/trust requirements**: display legal entity name, **MST (tax code)**, hotlines, showroom
  addresses — Vietnamese buyers expect these as credibility signals.
- **Phone-first contact culture**: prominent hotlines, floating call/Zalo-style CTAs, click-to-call.

---

## 2. Reference sites (UX / IA only — never copy assets or copy)

Real VinFast **dealer** sites in the same market. Used for **layout, information architecture, and
conversion-pattern research** — do **not** copy HTML, CSS, images, or marketing copy.

| Site | URL | Role for research |
|---|---|---|
| Dealer A | https://vinfast3sgiatothcm.com/ | 3S dealer HCMC — full sales+service IA, test-drive/deposit CTAs |
| Dealer B | https://vinfastsaigoncenter.com/ | Saigon Center dealer — home layout, model catalog, promo patterns |
| Dealer C | https://vinfastnamthaibinhduong.vn/ | Bình Dương dealer — multi-showroom footer, hotlines, regional trust |

**Research focus (for the UI researcher):** hero/lineup layout, model-detail structure (spec strip,
variants, features, FAQ), lead-form patterns (test drive / deposit), showroom & hotline presentation,
promo/countdown treatment, footer/legal/MST block, mobile-first navigation, and Vietnamese-market
conversion cues (floating contact, click-to-call, Zalo). Extract structure and palette/typography
*patterns*, not brand assets.

---

## 3. Product scope (v1)

**Cars only** — catalog, model detail, lead capture, and supporting dealer pages.

- **Default locale** `vi`; **secondary** `en` (English path segments, e.g. `/en/book-test-drive`).
- **Public:** home (hero, lineup, services, promo, news), model detail (variants, spec strip,
  features, gallery, FAQ, CTAs), lead forms (test drive primary; deposit/consult secondary),
  news, about, contact, policies, FAQ.
- **Admin CMS:** all dynamic content (vehicles, attributes/templates, homepage, news, pages,
  showrooms, hotlines, media, site settings, leads inbox).

### Out of scope (v1)
E-bikes/accessories, charging-station locator, user accounts, payment/checkout, used-car inventory,
careers, online service booking.

---

## 4. Internationalization model

| Tier | What | Storage |
|---|---|---|
| 1 — Attributes | `key`, `value`, `unit` only | DB; labels in `messages/*.json`; units in DB |
| 2 — Descriptions | Marketing copy | `{ vi, en }` in DB |
| 3 — Slugs | URL segments per locale | `{ vi, en }` in DB |

English routes use English path segments (`/en/book-test-drive`, not `/en/dang-ky-lai-thu`).

---

## 5. Admin feature spec (summary)

Route `/admin`, role-based (**Super Admin** / **Editor** / **Sales**). VN | EN tabs on bilingual fields.

- **Auth & users** — login, session, roles.
- **Site settings** — dealer name, legal entity, MST, email, copyright `{vi,en}`; logo/favicon;
  socials, consent template, SEO defaults, disclaimers, maintenance toggle.
- **Hotlines / Navigation** — CRUD with `{vi,en}` labels, order, showroom link, CTA route keys.
- **Attributes** — units catalog, attribute keys, reusable templates (apply / save-as-template).
- **Vehicle catalog** — lines, segments, models (name/slug/tagline/description/meta `{vi,en}`,
  hero, gallery), variants (price, deposit/test-drive/published flags), attributes `[{key,value,unit}]`,
  feature sections, model FAQs.
- **Homepage CMS** — hero slides, service blocks, brand story, trade-in, promo countdown.
- **News / pages / policies / FAQ** — bilingual CRUD with per-locale slugs; policy PDFs.
- **Showrooms** — name/address/hours `{vi,en}`, city, type tag, lat/lng.
- **Leads inbox** — types test_drive/deposit/consult; status new→contacted→closed; filter, CSV export.
- **Media library** — R2 upload/delete, metadata; folders `vehicles/heroes/news/policies/site`.
- **SEO & publishing** — per-locale meta, sitemap for `/vi/*` & `/en/*`, cache-bust on writes.

---

## 6. Brand/asset replacement (pre-deploy discipline)

VinFast references are **UX only**. Before deploy: no `vinfast`/`VINFAST` strings in public HTML,
meta, or assets; no links to vinfastauto.com in legal/consent; all logos, car photos, model names,
slogans, hotlines, MST, legal entity, and showroom data are **admin-uploaded or generic placeholders**.
Full checklist tracked in `docs/deploy-checklist.md`.

---

## Related docs
- [techstack.md](./techstack.md) — technology choices (greenfield TypeScript rework)
- [implementation-plan.md](./implementation-plan.md) — build phases and tasks
- [reference-site-layouts.md](./reference-site-layouts.md) — extracted layout notes from reference research
