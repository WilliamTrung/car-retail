# Tech Stack — car-retail (TypeScript rework)

Authoritative conventions: `.cursor/rules/nextjs-developer.mdc`. Live code under `web/src/` wins over any archived v1 notes.

## Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js `^15.2` (App Router, `output: "standalone"`) |
| Language | **TypeScript `^5.8` strict** (+ `noUncheckedIndexedAccess`) |
| UI | React `^19` · plain **CSS + CSS Modules** (no Tailwind / shadcn / CSS-in-JS) |
| i18n | next-intl `^4` (`vi` default + `en`, localized pathnames) |
| Database | PostgreSQL (external) |
| ORM | Prisma `^6.5` |
| Validation | Zod `^4` (DTOs + fail-fast env) |
| Auth | Auth.js v5 (`next-auth@5-beta`) + `@auth/prisma-adapter` — **DB-backed revocable sessions** |
| Object storage | Cloudflare R2 via `@aws-sdk/client-s3` |
| Cache | Next.js Data Cache + **tag-based `revalidateTag` only** (`src/server/cache/tags.ts`) |
| Logging | pino |
| Tests | Vitest (unit) · Playwright (E2E smoke) |
| Runtime | Node 24 · npm |
| Containerization | Docker Compose (`app` + `migrate` only) |

## Architecture (layered — mandatory)

```
Browser → Next.js (transport)
              → service  (business logic, authz, writes + revalidateTag)
              → repository (Prisma only)
              → PostgreSQL / R2
```

| Layer | Lives in | Rules |
|-------|----------|-------|
| **Transport** | `app/**` route handlers, Server Actions, Server Components | Parse/validate (Zod), resolve auth, call service, format response. **Never import Prisma.** |
| **Service** | `src/server/modules/<domain>/*.service.ts` | Business logic, transactions, orchestration. **Only services write.** Every mutation calls `revalidateTag(...)`. Transport-free (no `Request` / `cookies`). |
| **Repository** | `*.repository.ts` | Pure Prisma queries → typed entities. |
| **Schema / mapper** | `*.schema.ts`, `*.mapper.ts` | Zod DTOs (exported contract for frontend) · Prisma row ↔ DTO (Decimal → number, `{vi,en}` JSON). |

### Mutations & API

- **Server Actions** for all admin + form writes (colocated `actions.ts`): `requireAdmin(module)` + Zod + service + typed `Result`.
- **Thin REST** only: `POST /api/leads`, `GET /api/models/[slug]`, `GET /api/health`, `GET/POST /api/auth/[...nextauth]`. No other REST.

## Auth & RBAC

- Auth.js v5 + Prisma adapter; sessions are revocable by deleting the `Session` row.
- Roles: `SUPER_ADMIN` / `EDITOR` / `SALES` (`AdminRole` enum).
- `canAccess(role, module)` in `src/server/auth/rbac.ts`; `requireAdmin(module)` in actions/pages.
- `middleware.ts` cookie-gates `/admin/**` (validity enforced in Node via `auth()`).

## Caching (single strategy)

| Mechanism | Use |
|-----------|-----|
| `cachedRead` + tag registry | Public/catalog reads (`src/server/cache/tags.ts`) |
| `revalidateTag` / `revalidateTags` | After every mutating service write |

**Not used:** Redis, in-memory `Map` caches, manual key versioning, `lib/cache.js`.

## Data & i18n

- Descriptions/slugs: `{ vi, en }` JSON. Empty `en` → show `vi`.
- Attributes: `[{ key, value, unit }]` — no locale on values; labels in `messages/[locale].json` → `spec.*`.
- Units: DB `{ key, value: { vi, en } }`.
- Model API returns **exactly** `{ units, attributes }` — no `label` / `display` from server.
- **All UI copy** in `messages/*.json` — no `locale === "vi" ? …` ternaries.

## Environment variables

Parsed fail-fast by `src/server/config/env.ts` (Zod). Nothing else reads `process.env` for secrets.

```env
DATABASE_URL=postgresql://user:password@host:5432/car_retail
AUTH_SECRET=                    # ≥16 chars — Auth.js
STORAGE_S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
STORAGE_S3_REGION=auto
STORAGE_S3_BUCKET=car-retail-media
STORAGE_S3_ACCESS_KEY=
STORAGE_S3_SECRET_KEY=
STORAGE_S3_PUBLIC_URL=https://media.example.com
STORAGE_S3_USE_SSL=true
NEXT_PUBLIC_SITE_URL=https://example.com
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=            # ≥12 chars — prisma seed only
NODE_ENV=production
```

**Not used:** `REDIS_URL`, `SESSION_SECRET` (HMAC cookie era), `ADMIN_EMAIL` / `ADMIN_PASSWORD` (replaced by `SEED_ADMIN_*`).

## Cloudflare R2

- Client: `src/server/storage/r2.ts`
- Media metadata in `MediaAsset`; binaries only in R2 (folders: `vehicles/`, `heroes/`, `news/`, `policies/`, `site/`)

## Docker Compose

**Services:** `app` (Next.js standalone) · `migrate` (`prisma migrate deploy`, one-shot)

**Excluded:** postgres, redis, minio (external via env)

**Networks (VPS):** `proxy-net`, `db-net` (external)

**Files:** root `docker-compose.yml`, `deploy.env.example` · `web/Dockerfile`, `web/.dockerignore`, `web/.env.example`

## Project structure

```
car-retail/
├── web/
│   ├── src/
│   │   ├── app/                 # [locale] public · admin · api
│   │   ├── server/              # auth, cache, config, db, modules, storage
│   │   ├── lib/                 # i18n helpers, public queries, seo
│   │   ├── middleware.ts
│   │   └── …
│   ├── components/              # CSS Modules UI (frontend-owned)
│   ├── styles/
│   ├── messages/
│   ├── prisma/
│   ├── tests/                   # unit (vitest) · e2e (playwright)
│   ├── Dockerfile
│   └── .env.example
├── docs/
├── docker-compose.yml
└── deploy.env.example
```

## Verify

```bash
cd web
npm run typecheck    # tsc --noEmit
npm run test         # vitest run
npm run test:e2e     # playwright (needs build + env + DB)
npm run build
npm run lint
```

## Related docs

- [project-context.md](./project-context.md)
- [implementation-plan.md](./implementation-plan.md)
