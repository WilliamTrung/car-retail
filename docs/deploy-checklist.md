# Deploy checklist — car-retail Phase 6

Use on VPS after Phases 0–5 are complete locally.

## 1. Directory layout

```text
$HOME/repo/car-retail
~/prod/shared/car-retail/secrets/app/.env
~/prod/shared/car-retail/secrets/deploy.env
~/prod/shared/car-retail/logs/
```

## 2. Secrets

Copy from repo examples and fill real values:

- `web/.env.example` → `~/prod/shared/car-retail/secrets/app/.env`
- `deploy.env.example` → `~/prod/shared/car-retail/secrets/deploy.env`

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
docker compose --env-file ~/prod/shared/car-retail/secrets/deploy.env run --rm migrate
docker compose --env-file ~/prod/shared/car-retail/secrets/deploy.env up -d --build
```

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
docker compose --env-file ~/prod/shared/car-retail/secrets/deploy.env down
git checkout <previous-tag>
docker compose --env-file ~/prod/shared/car-retail/secrets/deploy.env up -d --build
```
