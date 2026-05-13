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
  en: { login: "Sign in", logout: "Sign out", account: "Account" },
  zh: { login: "登录", logout: "退出", account: "账号" },
  ja: { login: "ログイン", logout: "ログアウト", account: "アカウント" },
  ko: { login: "로그인", logout: "로그아웃", account: "계정" },
  es: { login: "Entrar", logout: "Salir", account: "Cuenta" },
  fr: { login: "Connexion", logout: "Déconnexion", account: "Compte" },
  de: { login: "Anmelden", logout: "Abmelden", account: "Konto" },
  pt: { login: "Entrar", logout: "Sair", account: "Conta" },
  ru: { login: "Войти", logout: "Выйти", account: "Аккаунт" },
  ar: { login: "تسجيل الدخول", logout: "تسجيل الخروج", account: "الحساب" },
  hi: { login: "लॉग इन", logout: "लॉग आउट", account: "खाता" },
  id: { login: "Masuk", logout: "Keluar", account: "Akun" },
  vi: { login: "Đăng nhập", logout: "Đăng xuất", account: "Tài khoản" },
  th: { login: "เข้าสู่ระบบ", logout: "ออกจากระบบ", account: "บัญชี" },
  tr: { login: "Giriş", logout: "Çıkış", account: "Hesap" },
  it: { login: "Accedi", logout: "Esci", account: "Account" },
  nl: { login: "Inloggen", logout: "Uit", account: "Account" },
  pl: { login: "Zaloguj", logout: "Wyloguj", account: "Konto" },
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
      <Link className="hidden-login-link" href={localizedHref("/login", language)} title={t.login} aria-label={t.login}>
        {language === "zh" ? "账号" : t.account}
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
