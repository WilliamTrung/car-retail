"use server";

import { AuthError } from "next-auth";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/server/auth";

export type LoginState = {
  error?: string;
};

/** Credentials login — creates a DB Session row (see auth `jwt.encode`). */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const locale = await getLocale();

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: `/${locale}/admin`,
    });
  } catch (error) {
    // Successful signIn throws NEXT_REDIRECT — rethrow non-Auth errors.
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  return {};
}

/** Destroy DB Session + clear cookie. */
export async function logoutAction(): Promise<void> {
  const locale = await getLocale();
  await signOut({ redirectTo: `/${locale}/admin/login` });
}

/** Non-form helper: redirect back to login with query param on failure. */
export async function loginFormAction(formData: FormData): Promise<void> {
  const result = await loginAction({}, formData);
  if (result.error) {
    const locale = await getLocale();
    redirect(
      `/${locale}/admin/login?error=${encodeURIComponent(result.error)}`,
    );
  }
}
