import { requireAdmin } from "@/server/auth/session";

/** Minimal dashboard home — section pages land in later tickets. */
export default async function AdminHomePage() {
  const session = await requireAdmin("dashboard");

  return (
    <>
      <h1>Admin</h1>
      <p>
        Signed in as {session.user.email} ({session.user.role})
      </p>
    </>
  );
}
