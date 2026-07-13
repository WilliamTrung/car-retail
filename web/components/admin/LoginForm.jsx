"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
        setError(data.error || "Login failed");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoBadge}>🛡️</div>
          <h1 className={styles.title}>Car Retail Admin</h1>
          <p className={styles.subtitle}>Enter your credentials to manage dealership systems</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          
          <label className={styles.field}>
            <span className={styles.label}>Email Address</span>
            <input 
              name="email" 
              type="email" 
              required 
              autoComplete="username" 
              placeholder="e.g. admin@example.com"
              className={styles.input}
            />
          </label>
          
          <label className={styles.field}>
            <span className={styles.label}>Password</span>
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
            {loading ? "Verifying Credentials…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
