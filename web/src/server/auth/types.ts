import type { AdminRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

export type SessionUser = {
  id: string;
  role: AdminRole;
} & DefaultSession["user"];

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }

  interface User {
    role: AdminRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    /** Points at `Session.sessionToken` — deleting that row revokes this JWT. */
    sessionToken?: string;
    role?: AdminRole;
  }
}
