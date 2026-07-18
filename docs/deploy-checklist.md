# Deploy checklist — car-retail Phase 6

Use on VPS after Phases 0–5 are complete locally.

## 1. Directory layout

```text
$HOME/repo/car-retail
~/dev/shared/car-retail/secrets/app/.env
~/dev/shared/car-retail/secrets/deploy.env
~/dev/shared/car-retail/logs/
```

## 2. Secrets

Copy from repo examples and fill real values:

- `web/.env.example` → `~/dev/shared/car-retail/secrets/app/.env`
- `deploy.env.example` → `~/dev/shared/car-retail/secrets/deploy.env`

Required:

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | External PostgreSQL |
| `STORAGE_S3_*` | Cloudflare R2 |
| `SESSION_SECRET` | Strong random string |
| `NEXT_PUBLIC_SITE_URL` | Public HTTPS URL |

## 3. External networks

Create once on VPS:

```bash
docker network create proxy-net
docker network create db-net
```

## 4. Deploy commands

```bash
cd $HOME/repo/car-retail
git pull
deploy car-retail
```

Or manually:

```bash
docker compose --env-file ~/dev/shared/car-retail/secrets/deploy.env run --rm migrate
docker compose --env-file ~/dev/shared/car-retail/secrets/deploy.env up -d --build
```

## 4.1 Seeding (git repo only)

All seed scripts and manifest data live **in the repo** — nothing is maintained separately on the VPS.

| Path | Purpose |
|------|---------|
| `web/prisma/seed.ts` | Base catalog, CMS, admin user (`prisma.user`), promoCountdown — run via `npm run db:seed` |
| `web/prisma/seed-media-data.js` | Media manifest (stable IDs, r2Keys, links) — targets the **scraped** dataset (`db:seed:scraped`) |
| `web/prisma/seed-media-urls.js` | Generated public URLs (committed after local seed) |
| `web/prisma/seed-media.js` | Media seed entry (plain node, self-contained — fetch → R2 upload → transactional DB swap; `--purge` deletes stale R2 objects last) |

**VPS holds only:** `$HOME/repo/car-retail` (git clone) and `~/dev/shared/car-retail/secrets/` (runtime env). No orphan seed files outside the clone.

**Canonical base seed:** `web/prisma/seed.ts` via `npm run db:seed` (`tsx prisma/seed.ts`). `tsx` is a **devDependency** — do **not** use `npm ci --omit=dev` for this step.

**Preferred (migrate image):** the Compose `migrate` service is built from the Dockerfile `migrator` target (`npm ci` **with** devDeps, so `tsx` is already on `PATH`). After `git pull` + migrate image build:

```bash
cd $HOME/repo/car-retail
docker compose --env-file ~/dev/shared/car-retail/secrets/deploy.env \
  run --rm --entrypoint sh migrate \
  -c 'npx prisma generate && npm run db:seed'
```

**One-shot host mount** (no migrate image): full `npm ci` so `tsx` installs, then the same script:

```bash
cd $HOME/repo/car-retail/web
docker run --rm \
  --env-file ~/dev/shared/car-retail/secrets/app/.env \
  --network db-net \
  -v "$HOME/repo/car-retail/web:/app" \
  -w /app node:24-alpine \
  sh -c 'apk add --no-cache libc6-compat && npm ci && npx prisma generate && npm run db:seed'
```

Media seed (unchanged — plain Node, no `tsx`):

```bash
cd $HOME/repo/car-retail/web
docker run --rm \
  --env-file ~/dev/shared/car-retail/secrets/app/.env \
  --network db-net \
  -v "$HOME/repo/car-retail/web:/app" \
  -w /app node:24-alpine \
  sh -c 'apk add --no-cache libc6-compat && npm ci && npx prisma generate && node prisma/seed-media.js --purge'
```

Or reuse the already-built migrate image — the media seed is self-contained under
`prisma/` (no `src/`, `tsconfig.json`, or host mounts needed):

```bash
cd $HOME/repo/car-retail
docker compose --env-file ~/dev/shared/car-retail/secrets/deploy.env \
  run --rm --entrypoint sh migrate \
  -c 'npx prisma generate && node prisma/seed-media.js --purge'
```

The seed is failure-safe: images are fetched and uploaded to R2 **before** the
MediaAsset swap (single transaction), and `--purge` removes only stale R2
objects **after** the swap commits — a mid-run crash leaves prior media intact.
The manifest links target the scraped dataset; run `db:seed:scraped` first or
unmatched links are skipped with warnings.

Prefer running `db:seed:media` locally, committing `seed-media-data.js` + `seed-media-urls.js`, then VPS only needs `git pull` before the media seed step (R2 + DB update). Do not edit seed manifests only on the VPS.

### Reseed visibility (SSG)

Homepage, model, and news routes are **SSG-prerendered at `next build`** from the live DB. After a reseed, `docker restart` or a plain `docker compose up -d --build` still serves **stale SSG pages** — Docker layer cache reuses the previous image build (and its baked HTML).

To make reseeded content visible, rebuild the app image with no cache, then recreate the container:

```bash
# after reseed
docker compose --env-file ~/dev/shared/car-retail/secrets/deploy.env build --no-cache app
docker compose --env-file ~/dev/shared/car-retail/secrets/deploy.env up -d
```

(Tradeoff if you want reseed without a no-cache rebuild: mark those routes `force-dynamic` or use a short `revalidate` — route changes are out of scope here.)

## 4.2 Reference scrape + full reseed (dev)

Scrape dealer/OEM sites with Playwright, generate catalog seed, wipe DB + R2, reload:

```bash
cd web
npm run scrape:reference    # Playwright → scripts/scrape-reference/output/manifest.json
npm run scrape:generate     # → prisma/seed-scraped.js, seed-media-data.js, docs/reference-site-layouts.md
npm run db:reseed           # reset DB + R2, bootstrap, scraped catalog, media upload
```

**Legal:** literal VinFast names/images in generated seed files are **dev reference only** — replace before public launch ([project-context.md](./project-context.md)).

On VPS (from repo checkout with env):

```bash
docker run --rm --env-file ~/dev/shared/car-retail/secrets/app/.env --network db-net \
  -v "$HOME/repo/car-retail/web:/app" -w /app node:22-alpine \
  sh -c 'apk add --no-cache libc6-compat && npm ci && npm run db:reseed'
```

Requires Playwright + Chromium on the machine running `scrape:reference` (typically local dev, not VPS).

## 5. Post-deploy verification

- [ ] `GET /api/health` → 200
- [ ] `/vi` and `/en` home pages load
- [ ] `/admin/login` — sign in with seeded admin
- [ ] R2 media upload from `/admin/media`
- [ ] Test-drive form creates lead in `/admin/leads`
- [ ] `/sitemap.xml` lists vi/en URLs
- [ ] Run `npm run predeploy:check` in `web/` (no banned branding in source)
- [ ] Asset checklist in `docs/project-context.md` signed off (no VinFast branding)

## 6. Rollback

```bash
docker compose --env-file ~/dev/shared/car-retail/secrets/deploy.env down
git checkout <previous-tag>
docker compose --env-file ~/dev/shared/car-retail/secrets/deploy.env up -d --build
```
