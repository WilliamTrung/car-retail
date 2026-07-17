import { logoutAction } from "@/server/auth/actions";
import { requireAdmin } from "@/server/auth/session";

/** Minimal protected admin home — proves auth + requireAdmin. */
export default async function AdminHomePage() {
  const session = await requireAdmin("dashboard");

  return (
    <main>
      <h1>Admin</h1>
      <p>
        Signed in as {session.user.email} ({session.user.role})
      </p>
      <form action={logoutAction}>
        <button type="submit">Sign out</button>
      </form>
    </main>
  );
}
