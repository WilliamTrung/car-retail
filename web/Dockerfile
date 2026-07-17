FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM deps AS migrator
COPY prisma ./prisma

FROM base AS builder
# Build-time placeholders — runtime secrets come from compose env_file
ARG DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG AUTH_SECRET=build-time-auth-secret-min-16
ARG STORAGE_S3_ENDPOINT=https://build.r2.cloudflarestorage.com
ARG STORAGE_S3_BUCKET=build
ARG STORAGE_S3_ACCESS_KEY=build
ARG STORAGE_S3_SECRET_KEY=build
ARG STORAGE_S3_PUBLIC_URL=https://media.example.com
ARG SEED_ADMIN_EMAIL=build@example.com
ARG SEED_ADMIN_PASSWORD=build-password-12
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV AUTH_SECRET=${AUTH_SECRET}
ENV STORAGE_S3_ENDPOINT=${STORAGE_S3_ENDPOINT}
ENV STORAGE_S3_BUCKET=${STORAGE_S3_BUCKET}
ENV STORAGE_S3_ACCESS_KEY=${STORAGE_S3_ACCESS_KEY}
ENV STORAGE_S3_SECRET_KEY=${STORAGE_S3_SECRET_KEY}
ENV STORAGE_S3_PUBLIC_URL=${STORAGE_S3_PUBLIC_URL}
ENV SEED_ADMIN_EMAIL=${SEED_ADMIN_EMAIL}
ENV SEED_ADMIN_PASSWORD=${SEED_ADMIN_PASSWORD}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache wget
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
