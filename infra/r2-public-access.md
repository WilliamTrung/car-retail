# R2 bucket public-read + CORS (T-0082)

## Public read

Media is served via the R2 **r2.dev** public bucket URL (`STORAGE_S3_PUBLIC_URL`,
e.g. `https://pub-….r2.dev`). Enable in Cloudflare dashboard:

1. R2 → bucket `car-retail-media` (or your `STORAGE_S3_BUCKET`)
2. Settings → **Public access** → Allow Access / Connect R2.dev subdomain
3. Confirm `HEAD`/`GET` on `STORAGE_S3_PUBLIC_URL/<key>` returns 200 with the
   object's `Content-Type`

S3 API tokens alone cannot toggle public access — that is a Cloudflare R2
dashboard / Account API setting.

## CORS

Canonical rules: [`r2-cors.json`](./r2-cors.json).

Apply:

```bash
cd web
npm run r2:apply-cors
```

Requires `STORAGE_S3_*` with permission to `PutBucketCors` / `GetBucketCors`.
If the S3 API token returns `AccessDenied`, use either:

- Cloudflare dashboard → R2 → bucket → Settings → CORS policy (paste JSON), or
- Cloudflare Account API token with `Account.Cloudflare R2:Edit` and set CORS
  via the R2 HTTP API.

## Content-Type backfill

Stale objects (wrong/missing Content-Type) cause `ERR_BLOCKED_BY_ORB`:

```bash
cd web
npm run r2:backfill-content-type -- --dry-run
npm run r2:backfill-content-type
```
