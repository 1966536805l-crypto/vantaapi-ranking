"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { localizedHref, type InterfaceLanguage } from "@/lib/language";

type HeaderUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
};

const copy: Record<InterfaceLanguage, { login: string; logout: string; account: string }> = {
  en: { login: "Sign in", logout: "Out", account: "Account" },
  zh: { login: "登录", logout: "退", account: "账号" },
  ja: { login: "ログイン", logout: "退出", account: "アカウント" },
  ko: { login: "로그인", logout: "나가기", account: "계정" },
  es: { login: "Entrar", logout: "Salir", account: "Cuenta" },
  fr: { login: "Connexion", logout: "Sortir", account: "Compte" },
  de: { login: "Anmelden", logout: "Raus", account: "Konto" },
  pt: { login: "Entrar", logout: "Sair", account: "Conta" },
  ru: { login: "Войти", logout: "Выйти", account: "Аккаунт" },
  ar: { login: "تسجيل الدخول", logout: "خروج", account: "الحساب" },
  hi: { login: "लॉग इन", logout: "बाहर", account: "खाता" },
  id: { login: "Masuk", logout: "Keluar", account: "Akun" },
  vi: { login: "Dang nhap", logout: "Thoat", account: "Tai khoan" },
  th: { login: "เข้าสู่ระบบ", logout: "ออก", account: "บัญชี" },
  tr: { login: "Giris", logout: "Cik", account: "Hesap" },
  it: { login: "Accedi", logout: "Esci", account: "Account" },
  nl: { login: "Inloggen", logout: "Uit", account: "Account" },
  pl: { login: "Zaloguj", logout: "Wyjdz", account: "Konto" },
};

export default function AuthStatusButton({ language = "en" }: { language?: InterfaceLanguage }) {
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
