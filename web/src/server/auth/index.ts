import "./types";

import { randomUUID } from "node:crypto";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "@auth/core/adapters";
import type { AdminRole } from "@prisma/client";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { getEnv } from "@/server/config/env";
import { prisma } from "@/server/db/prisma";

import { verifyPassword } from "./password";

const SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60; // 30 days

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const adapter = PrismaAdapter(prisma) as Adapter;

/**
 * Auth.js refuses `session.strategy: "database"` when the only provider is
 * Credentials (`UnsupportedStrategy`). We use JWT cookies (required) and
 * still persist a `Session` row via the Prisma adapter on login. Every
 * `jwt` callback re-checks that row — deleting it (or logout) revokes access.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  trustHost: true,
  // Lazy: fail-fast via getEnv on first use (not at import / typecheck).
  get secret() {
    return getEnv().AUTH_SECRET;
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SEC,
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.passwordHash) return null;
        if (!verifyPassword(parsed.data.password, user.passwordHash)) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Credentials sign-in: create EXACTLY ONE Session row per login.
      // Auth.js may re-invoke jwt() with `account` still set (sign-in
      // round-trip, and again when revalidateTag forces an RSC re-render
      // that re-runs auth()). Creating again would mint a second row,
      // overwrite token.sessionToken, and orphan the cookie-tracked row
      // → revocation check returns null → logout-on-save.
      if (account?.provider === "credentials" && user?.id) {
        // Idempotent: only mint when JWT does not already track a Session.
        // Re-fires reuse the existing token.sessionToken.
        if (!token.sessionToken) {
          const sessionToken = randomUUID();
          const expires = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000);
          await adapter.createSession?.({
            sessionToken,
            userId: user.id,
            expires,
          });
          token.sessionToken = sessionToken;
        }

        token.sub = user.id;
        token.role = user.role;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        return token;
      }

      // Subsequent requests: Session row must still exist (revocation check).
      // A valid cookie-tracked row must survive revalidateTag-driven re-renders —
      // only hard-logout when the row is missing or expired (real revoke / TTL).
      if (!token.sessionToken) {
        return null;
      }

      const existing = await prisma.session.findUnique({
        where: { sessionToken: token.sessionToken },
        include: { user: true },
      });
      if (!existing || existing.expires.valueOf() < Date.now()) {
        if (existing) {
          await adapter.deleteSession?.(token.sessionToken);
        }
        return null;
      }

      token.sub = existing.user.id;
      token.role = existing.user.role;
      token.email = existing.user.email;
      token.name = existing.user.name ?? undefined;
      return token;
    },
    async session({ session, token }) {
      if (!token.sub || !token.sessionToken || !token.role) {
        // Treat as logged out — middleware cookie may still linger until cleared
        return { ...session, user: { ...session.user, id: "", role: undefined as unknown as AdminRole } };
      }
      session.user.id = token.sub;
      session.user.role = token.role;
      if (token.email) session.user.email = token.email;
      if (token.name !== undefined) session.user.name = token.name ?? null;
      return session;
    },
  },
  events: {
    async signOut(message) {
      const sessionToken =
        "token" in message ? message.token?.sessionToken : undefined;
      if (!sessionToken) return;
      try {
        await adapter.deleteSession?.(sessionToken);
      } catch {
        // Already deleted / race — ignore
      }
    },
  },
});
