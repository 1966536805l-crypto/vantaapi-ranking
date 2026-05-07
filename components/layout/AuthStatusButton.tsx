"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { localizedHref, type SiteLanguage } from "@/lib/language";

type HeaderUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
};

const copy = {
  en: {
    login: "Sign in",
    logout: "Out",
    account: "Account",
  },
  zh: {
    login: "登录",
    logout: "退",
    account: "账号",
  },
} as const;

export default function AuthStatusButton({ language = "en" }: { language?: SiteLanguage }) {
  const t = copy[language];
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { user?: HeaderUser | null }) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setUser(null);
    window.location.href = localizedHref("/login", language);
  }

  if (loading) {
    return <span className="auth-nav-skeleton" aria-label={t.account} />;
  }

  if (!user) {
    return (
      <Link className="apple-button-primary px-4 py-1.5" href={localizedHref("/login", language)}>
        {t.login}
      </Link>
    );
  }

  const label = (user.name || user.email.split("@")[0]).slice(0, 14);

  return (
    <span className="auth-nav-user">
      <Link className="auth-nav-name" href={localizedHref("/dashboard", language)} title={user.email}>
        {label}
      </Link>
      <button type="button" disabled={busy} onClick={logout} className="auth-nav-logout">
        {t.logout}
      </button>
    </span>
  );
}
