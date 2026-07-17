# car-retail

Bilingual (Vietnamese / English) car dealership marketing website with an admin CMS. Public site for vehicle catalog, model pages, lead capture, and dealer content. Admin back-office for vehicles, media, settings, and leads.

**Default locale:** `vi` · **Secondary locale:** `en`

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | JavaScript |
| Styling | CSS Modules + global CSS |
| i18n | next-intl |
| Database | PostgreSQL |
| ORM | Prisma |
| Media | Cloudflare R2 (S3-compatible) |
| Cache | In-memory only (no Redis) |
| Deploy | Docker Compose (`app` + `migrate`) |

External services (PostgreSQL, R2) are configured via environment variables only — not bundled in Compose.

## Repository layout

```
car-retail/
├── web/                 # Next.js application
│   ├── app/             # Public [locale] routes + /admin + /api
│   ├── components/
│   ├── lib/
│   ├── messages/        # vi.json, en.json
│   ├── prisma/          # schema, migrations, seed
│   └── scripts/
├── docs/                # Project context, tech stack, implementation plan
├── docker-compose.yml
├── deploy.env.example
└── README.md
```

## Prerequisites

- Node.js 20+
- PostgreSQL (local or remote)
- Cloudflare R2 bucket (or compatible S3 storage) for media uploads
- Docker (optional, for production-style deploy)

## Local development

### 1. Install dependencies

```bash
cd web
npm install
```

### 2. Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables (see `web/.env.example`):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `STORAGE_S3_*` | Cloudflare R2 / S3 credentials and public URL |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (e.g. `http://localhost:3000`) |
| `SESSION_SECRET` | Admin session signing secret |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Dev seed admin user (optional) |

> **Never commit `.env`.** Only `.env.example` is tracked in git.

### 3. Database

```bash
cd web
npx prisma migrate deploy   # or: npm run db:migrate (dev)
npm run db:seed             # base catalog + admin user
```

Optional dev data:

```bash
npm run db:seed:mock        # richer mock content
npm run db:seed:media       # import dealer photos → R2 (needs scraped dataset; --purge deletes stale R2 objects)
```

Seed manifests (`web/prisma/seed-media-data.js`, `seed-media-urls.js`) are **committed in git**. VPS runs the same scripts from `$HOME/repo/car-retail` after `git pull` — only secrets live outside the repo (`~/prod/shared/.../secrets/`).

### 4. Run dev server

```bash
npm run dev
```

- Public site: [http://localhost:3000/vi](http://localhost:3000/vi)
- Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Default seed admin (if using `.env.example` defaults):

- Email: `admin@example.com`
- Password: `change-me`

## Public routes

| Page | Vietnamese | English |
|------|------------|---------|
| Home | `/vi` | `/en` |
| Model detail | `/vi/models/[slug]` | `/en/models/[slug]` |
| Test drive | `/vi/dang-ky-lai-thu` | `/en/book-test-drive` |
| Deposit | `/vi/dat-coc` | `/en/deposit` |
| News | `/vi/tin-tuc` | `/en/news` |
| About | `/vi/ve-chung-toi` | `/en/about` |
| Contact | `/vi/lien-he` | `/en/contact` |
| Policies | `/vi/chinh-sach` | `/en/policies` |

Admin routes live under `/admin` (no locale prefix).

## Admin modules

| Route | Purpose |
|-------|---------|
| `/admin/settings` | Dealer identity, legal info, CTAs, social links |
| `/admin/showrooms` | Showroom branches & hotlines |
| `/admin/navigation` | Header/footer menu items |
| `/admin/models` | Vehicle catalog & attributes |
| `/admin/templates` | Attribute templates |
| `/admin/media` | R2 media library |
| `/admin/homepage` | Hero slides & service blocks |
| `/admin/news` | News posts |
| `/admin/pages` | About, contact, FAQ, policies |
| `/admin/leads` | Lead inbox & export |

## Docker deploy

Compose runs **app + migrate only**. PostgreSQL and R2 remain external.

```bash
cp deploy.env.example deploy.env
# Edit deploy.env and web/.env (or VPS secrets path)

docker compose --env-file deploy.env run --rm migrate
docker compose --env-file deploy.env up -d --build
```

See [docs/deploy-checklist.md](docs/deploy-checklist.md) for VPS paths and sign-off steps.

## Documentation

- [docs/project-context.md](docs/project-context.md) — scope, admin spec, asset checklist
- [docs/techstack.md](docs/techstack.md) — architecture, env contract, caching
- [docs/implementation-plan.md](docs/implementation-plan.md) — build phases and route map

## Scripts (web/)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:deploy` | Prisma migrate deploy |
| `npm run db:seed` | Seed base data |
| `npm run db:seed:mock` | Seed mock/demo content |
| `npm run db:seed:media` | Upload media from `prisma/seed-media-data.js` to R2, swap MediaAsset rows, write URLs (`-- --purge` also deletes stale R2 objects; run after `db:seed:scraped`) |

## License

Private / proprietary unless otherwise specified by the repository owner.
