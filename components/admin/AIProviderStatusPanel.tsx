"use client";

import { useEffect, useState } from "react";

type Provider = {
  id: "gateway" | "ollama" | "built-in";
  label: string;
  role: "primary" | "fallback" | "final";
  enabled: boolean;
  configured: boolean;
  status: "ready" | "online" | "offline" | "disabled" | "always-on";
  model: string;
  endpoint: string;
  latencyMs?: number;
  note: string;
};

type ProviderResponse = {
  success?: boolean;
  generatedAt?: string;
  route?: string;
  providers?: Provider[];
  message?: string;
};

const statusTone: Record<Provider["status"], string> = {
  ready: "border-blue-200 bg-blue-50 text-blue-800",
  online: "border-emerald-200 bg-emerald-50 text-emerald-800",
  offline: "border-rose-200 bg-rose-50 text-rose-800",
  disabled: "border-slate-200 bg-slate-50 text-slate-700",
  "always-on": "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export default function AIProviderStatusPanel() {
  const [data, setData] = useState<ProviderResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchStatus() {
    const response = await fetch("/api/admin/ai-providers", { cache: "no-store" });
    const payload = (await response.json().catch(() => ({}))) as ProviderResponse;
    return response.ok ? payload : { success: false, message: payload.message || "AI provider status unavailable" };
  }

  async function loadStatus() {
    setLoading(true);
    setData(await fetchStatus());
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;

    async function loadInitialStatus() {
      const payload = await fetchStatus();
      if (mounted) setData(payload);
    }

    void loadInitialStatus();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="apple-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">AI Provider Routing</p>
          <h2 className="mt-2 text-2xl font-semibold">GLM Ollama fallback chain</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
            Admin only status check. It shows provider readiness without exposing keys or spending model tokens.
          </p>
        </div>
        <button type="button" onClick={loadStatus} disabled={loading} className="apple-button-secondary px-4 py-2 text-sm disabled:opacity-50">
          {loading ? "Checking" : "Refresh"}
        </button>
      </div>

      {data?.message && (
        <div className="mt-4 rounded-[8px] border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{data.message}</div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {(data?.providers || []).map((provider) => (
          <div key={provider.id} className="rounded-[8px] border border-[color:var(--hair)] bg-white/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-950">{provider.label}</p>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone[provider.status]}`}>
                {provider.status}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-xs leading-5 text-[color:var(--muted)]">
              <p>Role {provider.role}</p>
              <p>Model {provider.model}</p>
              <p>Endpoint {provider.endpoint}</p>
              {typeof provider.latencyMs === "number" && <p>Latency {provider.latencyMs}ms</p>}
              <p>{provider.note}</p>
            </div>
          </div>
        ))}
      </div>

      {data?.route && <p className="mt-4 text-xs text-[color:var(--muted)]">Route {data.route}</p>}
    </section>
  );
}
