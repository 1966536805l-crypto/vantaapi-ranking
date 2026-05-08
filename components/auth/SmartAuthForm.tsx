"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { bilingualLanguage, localizedHref, type InterfaceLanguage } from "@/lib/language";

type AuthMode = "login" | "register";

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
};

type SmartAuthFormProps = {
  language?: InterfaceLanguage;
  nextHref?: string;
  allowRegister?: boolean;
  initialMode?: AuthMode;
};

const copy = {
  en: {
    account: "Account",
    login: "Sign in",
    register: "Create account",
    titleLogin: "Welcome back",
    titleRegister: "Start your account",
    subtitleLogin: "Use your email and password to continue learning",
    subtitleRegister: "Create one account for progress wrong questions and admin tools",
    email: "Email",
    name: "Name",
    optional: "optional",
    password: "Password",
    twoFactorCode: "2FA code",
    show: "Show",
    hide: "Hide",
    signingIn: "Signing in",
    creating: "Creating",
    actionLogin: "Sign in",
    actionRegister: "Create account",
    back: "Back home",
    next: "After sign in",
    dashboard: "Learning dashboard",
    signedIn: "Signed in",
    continue: "Continue",
    logout: "Sign out",
    checking: "Checking account",
    passwordHint: "At least 12 characters",
    emailPlaceholder: "you@example.com",
    namePlaceholder: "Your name",
    errorLogin: "Sign in failed",
    errorRegister: "Account creation failed",
    twoFactorPlaceholder: "6 digit admin code",
  },
  zh: {
    account: "账号",
    login: "登录",
    register: "注册",
    titleLogin: "欢迎回来",
    titleRegister: "创建账号",
    subtitleLogin: "用邮箱和密码继续学习",
    subtitleRegister: "一个账号保存进度错题和后台权限",
    email: "邮箱",
    name: "姓名",
    optional: "可不填",
    password: "密码",
    twoFactorCode: "2FA 验证码",
    show: "显示",
    hide: "隐藏",
    signingIn: "登录中",
    creating: "创建中",
    actionLogin: "登录",
    actionRegister: "创建账号",
    back: "返回首页",
    next: "登录后进入",
    dashboard: "学习面板",
    signedIn: "已登录",
    continue: "继续",
    logout: "退出",
    checking: "检查账号",
    passwordHint: "至少 12 位",
    emailPlaceholder: "you@example.com",
    namePlaceholder: "你的名字",
    errorLogin: "登录失败",
    errorRegister: "注册失败",
    twoFactorPlaceholder: "管理员 6 位动态码",
  },
} as const;

export default function SmartAuthForm({
  language = "en",
  nextHref = localizedHref("/dashboard", language),
  allowRegister = false,
  initialMode = "login",
}: SmartAuthFormProps) {
  const t = copy[bilingualLanguage(language)];
  const [mode, setMode] = useState<AuthMode>(allowRegister ? initialMode : "login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const formStartedAt = useRef(0);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    formStartedAt.current = Date.now();
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { user?: AuthUser | null }) => {
        if (!cancelled) setCurrentUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setCurrentUser(null);
      })
      .finally(() => {
        if (!cancelled) setCheckingUser(false);
      });

    requestAnimationFrame(() => {
      const storedEmail = window.localStorage.getItem("vantaapi-auth-email") || window.localStorage.getItem("vantaapi-auth-email");
      if (!cancelled && storedEmail) setEmail(storedEmail);
      if (!cancelled) emailRef.current?.focus();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function switchMode(nextMode: AuthMode) {
    if (nextMode === "register" && !allowRegister) return;
    setMode(nextMode);
    setError("");
    requestAnimationFrame(() => emailRef.current?.focus());
  }

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setCurrentUser(null);
    setLoading(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const payload =
      mode === "register"
        ? { name: name.trim() || undefined, email: email.trim(), password, website, formStartedAt: formStartedAt.current || Date.now() - 1000, turnstileToken }
        : { email: email.trim(), password, twoFactorCode: twoFactorCode.trim() || undefined, website, formStartedAt: formStartedAt.current || Date.now() - 1000, turnstileToken };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.message || (mode === "login" ? t.errorLogin : t.errorRegister));
      return;
    }

    window.localStorage.setItem("vantaapi-auth-email", email.trim());
    window.location.href = nextHref;
  }

  return (
    <main className="auth-page apple-page">
      <section className="auth-shell">
        <div className="auth-side">
          <div className="flex items-center justify-between gap-3">
            <Link href={localizedHref("/", language)} className="auth-brand">
              <span className="auth-brand-mark">JM</span>
              <span>JinMing Lab</span>
            </Link>
            <FlagLanguageToggle initialLanguage={language} />
          </div>

          <div className="auth-copy">
            <p className="eyebrow">{t.account}</p>
            <h1 className="apple-display-title">{allowRegister && mode === "register" ? t.titleRegister : t.titleLogin}</h1>
            <p className="apple-display-subtitle">{allowRegister && mode === "register" ? t.subtitleRegister : t.subtitleLogin}</p>
          </div>

          <div className="auth-route-grid">
            <Link href={localizedHref("/english", language)} className="dense-mini">
              <span>English</span>
              <span>IELTS TOEFL CET</span>
            </Link>
            <Link href={localizedHref("/cpp", language)} className="dense-mini">
              <span>C++</span>
              <span>classified drills</span>
            </Link>
            <Link href={localizedHref("/wrong", language)} className="dense-mini">
              <span>Review</span>
              <span>wrong bank</span>
            </Link>
            <Link href={localizedHref("/dashboard", language)} className="dense-mini">
              <span>{t.dashboard}</span>
              <span>progress</span>
            </Link>
          </div>
        </div>

        <div className="auth-card apple-card">
          {allowRegister ? (
            <div className="auth-tabs" role="tablist" aria-label={t.account}>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                className={mode === "login" ? "auth-tab auth-tab-active" : "auth-tab"}
                onClick={() => switchMode("login")}
              >
                {t.login}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                className={mode === "register" ? "auth-tab auth-tab-active" : "auth-tab"}
                onClick={() => switchMode("register")}
              >
                {t.register}
              </button>
            </div>
          ) : (
            <div className="auth-single-title">
              <span className="auth-single-dot" />
              {t.login}
            </div>
          )}

          {checkingUser ? (
            <div className="auth-session">
              <span className="auth-session-dot" />
              <span>{t.checking}</span>
            </div>
          ) : currentUser ? (
            <div className="auth-session">
              <div>
                <p className="eyebrow">{t.signedIn}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{currentUser.name || currentUser.email}</p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{currentUser.email}</p>
              </div>
              <div className="flex gap-2">
                <Link href={nextHref} className="dense-action-primary">{t.continue}</Link>
                <button type="button" disabled={loading} onClick={logout} className="dense-action disabled:opacity-50">
                  {t.logout}
                </button>
              </div>
            </div>
          ) : null}

          <form onSubmit={submit} className="auth-form">
            <label className="bot-field" aria-hidden="true">
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </label>

            {allowRegister && mode === "register" && (
              <label className="auth-field">
                <span className="eyebrow">{t.name} {t.optional}</span>
                <input
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  placeholder={t.namePlaceholder}
                  className="auth-input"
                />
              </label>
            )}

            <label className="auth-field">
              <span className="eyebrow">{t.email}</span>
              <input
                ref={emailRef}
                required
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder={t.emailPlaceholder}
                className="auth-input"
              />
            </label>

            <label className="auth-field">
              <span className="eyebrow">{t.password}</span>
              <div className="auth-password-wrap">
                <input
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={allowRegister && mode === "register" ? "new-password" : "current-password"}
                  minLength={allowRegister && mode === "register" ? 12 : undefined}
                  placeholder={allowRegister && mode === "register" ? t.passwordHint : ""}
                  className="auth-input auth-input-password"
                />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? t.hide : t.show}
                </button>
              </div>
            </label>

            {mode === "login" && (
              <label className="auth-field">
                <span className="eyebrow">{t.twoFactorCode} {t.optional}</span>
                <input
                  name="twoFactorCode"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  autoComplete="one-time-code"
                  placeholder={t.twoFactorPlaceholder}
                  className="auth-input"
                />
              </label>
            )}

            {error && <p className="auth-error" role="alert">{error}</p>}

            <TurnstileWidget onToken={setTurnstileToken} />

            <button disabled={loading} className="apple-button-primary auth-submit disabled:opacity-55">
              {loading
                ? allowRegister && mode === "register"
                  ? t.creating
                  : t.signingIn
                : allowRegister && mode === "register"
                  ? t.actionRegister
                  : t.actionLogin}
            </button>

            <div className="auth-foot">
              <Link href={localizedHref("/", language)} className="link">{t.back}</Link>
              <span>{t.next} {t.dashboard}</span>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
