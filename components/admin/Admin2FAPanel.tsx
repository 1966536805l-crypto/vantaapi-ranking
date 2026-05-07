"use client";

import { useState } from "react";

type SetupResponse = {
  qrCode?: string;
  otpauthUrl?: string;
  message?: string;
};

export default function Admin2FAPanel() {
  const [setup, setSetup] = useState<SetupResponse | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function startSetup() {
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/auth/2fa/setup", { method: "POST" });
    const data = (await response.json().catch(() => ({}))) as SetupResponse;
    setLoading(false);
    if (!response.ok) return setMessage(data.message || "2FA setup failed");
    setSetup(data);
    setMessage("请用认证器扫描二维码，然后输入 6 位验证码确认启用。");
  }

  async function verify() {
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/auth/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: code }),
    });
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    setLoading(false);
    setMessage(data.message || (response.ok ? "2FA 已启用" : "2FA 验证失败"));
  }

  return (
    <section className="apple-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Admin 2FA</p>
          <h2 className="mt-2 text-2xl font-semibold">管理员动态验证码</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            管理员启用后，登录必须输入认证器 6 位 TOTP。密钥会加密后存入 User 表。
          </p>
        </div>
        <button type="button" onClick={startSetup} disabled={loading} className="apple-button-secondary px-4 py-2 text-sm disabled:opacity-50">
          {loading ? "处理中" : "生成 2FA 二维码"}
        </button>
      </div>

      {setup?.qrCode && (
        <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr] md:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup.qrCode} alt="Admin 2FA QR code" className="h-44 w-44 rounded-xl border border-[color:var(--hair)] bg-white p-2" />
          <div>
            <label className="auth-field">
              <span className="eyebrow">6 位验证码</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="auth-input"
                placeholder="123456"
              />
            </label>
            <button type="button" onClick={verify} disabled={loading || code.length !== 6} className="apple-button-primary mt-3 px-5 py-2.5 text-sm disabled:opacity-50">
              确认启用 2FA
            </button>
          </div>
        </div>
      )}

      {message && <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{message}</p>}
    </section>
  );
}
