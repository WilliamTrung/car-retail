/**
 * Thin shim — canonical entry is prisma/seed-media.js (Docker copies prisma/).
 * Prefer: npm run db:seed:media -- --purge
 */
import "../prisma/seed-media.js";
