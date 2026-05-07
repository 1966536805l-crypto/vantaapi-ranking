"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import TurnstileWidget from "@/components/security/TurnstileWidget";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const formStartedAt = useRef(0);

  useEffect(() => {
    formStartedAt.current = Date.now();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const body = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      name: String(form.get("name") || ""),
      username: String(form.get("username") || ""),
      website: String(form.get("website") || ""),
      formStartedAt: formStartedAt.current || Date.now() - 1000,
      turnstileToken,
    };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));

    setLoading(false);
    if (!response.ok) {
      setMessage(data.message || "请求失败");
      return;
    }

    router.push(searchParams.get("next") || "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4 border border-slate-200 bg-white p-6 shadow-sm">
      <label className="bot-field" aria-hidden="true">
        Website
        <input tabIndex={-1} autoComplete="off" name="website" />
      </label>
      {mode === "register" && (
        <>
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              name="name"
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-blue-400"
              placeholder="Student"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Username
            <input
              name="username"
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-blue-400"
              placeholder="student"
            />
          </label>
        </>
      )}
      <label className="block text-sm font-medium text-slate-700">
        Email
        <input
          required
          type="email"
          name="email"
          className="mt-2 w-full border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-blue-400"
          placeholder="student@jinming.local"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Password
        <input
          required
          type="password"
          name="password"
          minLength={12}
          className="mt-2 w-full border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-blue-400"
          placeholder="At least 12 characters"
        />
      </label>
      <TurnstileWidget onToken={setTurnstileToken} />
      {message && <p className="text-sm text-red-600">{message}</p>}
      <button
        disabled={loading}
        className="w-full border border-blue-700 bg-blue-700 px-4 py-3 font-semibold text-white disabled:border-slate-300 disabled:bg-slate-300"
      >
        {loading ? "Submitting..." : mode === "login" ? "Login" : "Create account"}
      </button>
    </form>
  );
}
