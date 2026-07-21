import { loginFormAction } from "@/server/auth/actions";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

/** Minimal unstyled login — enough to exercise Auth.js + DB sessions. */
export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <main>
      <h1>Admin login</h1>
      {error ? <p role="alert">{error}</p> : null}
      <form action={loginFormAction}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}
