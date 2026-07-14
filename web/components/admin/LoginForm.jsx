"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { a } from "@/lib/admin/strings";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.target);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || a.login.failed);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError(a.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoBadge}>🛡️</div>
          <h1 className={styles.title}>{a.login.title}</h1>
          <p className={styles.subtitle}>{a.login.subtitle}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error ? <div className={styles.error}>{error}</div> : null}

          <label className={styles.field}>
            <span className={styles.label}>{a.login.email}</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="admin@example.com"
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{a.login.password}</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={styles.input}
            />
          </label>

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? a.login.verifying : a.login.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
