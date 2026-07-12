# Tech Stack — car-retail

## Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | JavaScript |
| Styling | CSS Modules + `globals.css` |
| i18n | next-intl |
| Database | PostgreSQL |
| ORM | Prisma |
| Object storage | Cloudflare R2 (S3-compatible API) |
| Cache | In-memory (per process) — **no Redis** |
| Admin auth | Session-based (e.g. iron-session / Auth.js) |
| Containerization | Docker Compose (`app` + `migrate` only) |

## Architecture

```
Browser → Next.js app (Docker)
              ├── PostgreSQL (external, DATABASE_URL)
              ├── Cloudflare R2 (external, STORAGE_S3_*)
              └── In-memory cache (lib/cache.js, unstable_cache)
```

- **PostgreSQL** — structured CMS data, leads, attributes, units, templates
- **R2** — images, PDFs, logos (metadata in PostgreSQL `media_assets`)
- **Compose** — project-owned containers only; no postgres/redis/minio services

## Next.js conventions

- **Public routes:** `web/app/[locale]/` (`vi`, `en`)
- **Admin:** `web/app/admin/` (no locale prefix)
- **API:** `web/app/api/` route handlers
- **Server Components** default; `"use client"` for forms, language switcher, carousel
- **Data:** Prisma in Server Components; mutations via Route Handlers

## Internationalization

- Locales: `vi` (default), `en`
- Message files: `messages/vi.json`, `messages/en.json`
- Localized pathnames via next-intl `pathnames` config
- Attribute labels: `messages/*.json` → `spec.*` keys
- Unit display: DB `units` table → `{ key, value: { vi, en } }`

## API contract (vehicle attributes)

```json
{
  "units": [
    { "key": "km", "value": { "vi": "km", "en": "km" } }
  ],
  "attributes": [
    { "key": "range", "value": 562, "unit": "km" }
  ]
}
```

Attribute elements: **`key`, `value`, `unit` only** — no `label` or `display` from server. Client composes display using messages + units.

## Caching (no Redis)

| Mechanism | Use |
|-----------|-----|
| `unstable_cache` / `cache()` | Server Component reads (units, settings, menus) |
| `web/lib/cache.js` (Map + TTL) | Route handler memoization |
| `revalidatePath` / `revalidateTag` | Cache bust on admin writes |

TTL ~60–300s for catalog data. Leads always write-through to PostgreSQL.

## Environment variables

All external services via `.env` — nothing hardcoded.

### PostgreSQL
```env
DATABASE_URL=postgresql://user:password@host:5432/car_retail
```

### Cloudflare R2 (S3-compatible)
```env
STORAGE_S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
STORAGE_S3_REGION=auto
STORAGE_S3_BUCKET=car-retail-media
STORAGE_S3_ACCESS_KEY=
STORAGE_S3_SECRET_KEY=
STORAGE_S3_PUBLIC_URL=https://media.example.com
STORAGE_S3_USE_SSL=true
```

### App
```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://example.com
SESSION_SECRET=
ADMIN_EMAIL=          # dev seed only
ADMIN_PASSWORD=       # dev seed only
```

**Not used:** `REDIS_URL`, any Redis dependency.

## Cloudflare R2

- Client: `@aws-sdk/client-s3` from `web/lib/r2.js`
- Upload: `POST /api/admin/media/upload` → R2 + `media_assets` row
- Folders: `vehicles/`, `heroes/`, `news/`, `policies/`, `site/`
- Never store binaries in PostgreSQL or `public/` (except static UI icons)

## Docker Compose

Per [docker-compose-convention](https://github.com/) — app manages itself only.

**Services:**
| Service | Role |
|---------|------|
| `app` | Next.js production server |
| `migrate` | `prisma migrate deploy` (one-shot) |

**Excluded from Compose:** postgres, redis, minio

**External networks (VPS):**
- `proxy-net` — reverse proxy
- `db-net` — shared PostgreSQL

**VPS paths:**
```text
$HOME/repo/car-retail
~/prod/shared/car-retail/secrets/app/.env
~/prod/shared/car-retail/secrets/deploy.env
~/prod/shared/car-retail/logs/
```

**Repo files:**
- `docker-compose.yml`, `deploy.env.example` (repo root)
- `web/Dockerfile`, `web/.dockerignore`, `web/.env.example`

## Project structure

```
car-retail/
├── web/                   # Next.js application
│   ├── app/
│   │   ├── [locale]/      # public vi/en
│   │   ├── admin/         # CMS
│   │   └── api/
│   ├── components/
│   ├── lib/
│   │   ├── prisma.js
│   │   ├── cache.js
│   │   ├── r2.js
│   │   └── i18n/
│   ├── messages/
│   ├── prisma/
│   ├── styles/
│   ├── Dockerfile
│   └── .env.example
├── docs/
├── docker-compose.yml
└── deploy.env.example
```

## Implementation agent

Senior fullstack Next.js expert — conventions in `.cursor/rules/car-retail-nextjs.mdc`.

| Rule | Standard |
|------|----------|
| JS | ES modules, no TypeScript in v1 |
| CSS | CSS Modules, mobile-first |
| Config | `.env` only for external services |
| Media | R2 only |
| Cache | In-memory only |
| Docker | `app` + `migrate` only |

**Out of scope unless requested:** TypeScript, GraphQL, Redis, separate Express API.

## Related docs

- [project-context.md](./project-context.md)
- [implementation-plan.md](./implementation-plan.md)
