"use client";

import { useCallback, useEffect, useState } from "react";

type Provider = {
  id: "gateway" | "ollama" | "built-in";
  label: string;
  role: "primary" | "fallback" | "final";
  enabled: boolean;
  configured: boolean;
  status: "ready" | "online" | "offline" | "disabled" | "cooldown" | "always-on";
  model: string;
  endpoint: string;
  latencyMs?: number;
  cooldownSeconds?: number;
  circuitSource?: "memory" | "redis";
  note: string;
};

type ProviderResponse = {
  success?: boolean;
  generatedAt?: string;
  route?: string;
  providers?: Provider[];
  eventSummary?: {
    total: number;
    success: number;
    error: number;
    timeout: number;
    "rate-limited": number;
    disabled: number;
    lastEventAt: string | null;
  };
  message?: string;
};

type ProviderEvent = {
  id: string;
  at: string;
  provider: "gateway" | "ollama" | "built-in";
  operation: "chat" | "stream" | "fallback";
  status: "success" | "error" | "timeout" | "rate-limited" | "disabled";
  model: string;
  durationMs: number;
  httpStatus?: number;
  reason: string;
};

type EventsResponse = {
  success?: boolean;
  events?: ProviderEvent[];
  message?: string;
};

type DashboardState = {
  status: ProviderResponse;
  events: ProviderEvent[];
};

const statusTone: Record<Provider["status"], string> = {
  ready: "border-blue-200 bg-blue-50 text-blue-800",
  online: "border-emerald-200 bg-emerald-50 text-emerald-800",
  offline: "border-rose-200 bg-rose-50 text-rose-800",
  cooldown: "border-amber-200 bg-amber-50 text-amber-800",
  disabled: "border-slate-200 bg-slate-50 text-slate-700",
  "always-on": "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const eventTone: Record<ProviderEvent["status"], string> = {
  success: "text-emerald-700",
  error: "text-rose-700",
  timeout: "text-amber-700",
  "rate-limited": "text-orange-700",
  disabled: "text-slate-500",
};

export default function AIProviderStatusPanel() {
  const [dashboard, setDashboard] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    const response = await fetch("/api/admin/ai-providers", { cache: "no-store" });
    const payload = (await response.json().catch(() => ({}))) as ProviderResponse;
    return response.ok ? payload : { success: false, message: payload.message || "AI provider status unavailable" };
  }, []);

  const fetchEvents = useCallback(async () => {
    const response = await fetch("/api/admin/ai-events", { cache: "no-store" });
    const payload = (await response.json().catch(() => ({}))) as EventsResponse;
    return response.ok ? payload.events || [] : [];
  }, []);

  const fetchDashboard = useCallback(async () => {
    const [status, events] = await Promise.all([fetchStatus(), fetchEvents()]);
    return { status, events };
  }, [fetchEvents, fetchStatus]);

  async function loadStatus() {
    setLoading(true);
    setDashboard(await fetchDashboard());
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;

    async function loadInitialStatus() {
      const payload = await fetchDashboard();
      if (mounted) setDashboard(payload);
    }

    void loadInitialStatus();

    return () => {
      mounted = false;
    };
  }, [fetchDashboard]);

  const data = dashboard?.status;
  const events = dashboard?.events || [];
  const summary = data?.eventSummary;

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
              {typeof provider.cooldownSeconds === "number" && <p>Cooldown {provider.cooldownSeconds}s</p>}
              {provider.circuitSource && <p>Circuit {provider.circuitSource}</p>}
              <p>{provider.note}</p>
            </div>
          </div>
        ))}
      </div>

      {data?.route && <p className="mt-4 text-xs text-[color:var(--muted)]">Route {data.route}</p>}

      <div className="mt-5 rounded-[8px] border border-[color:var(--hair)] bg-slate-950 p-4 text-slate-100">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Recent AI Events</p>
            <p className="mt-1 text-sm text-slate-300">
              {summary
                ? `last 40 total ${summary.total} success ${summary.success} timeout ${summary.timeout} limited ${summary["rate-limited"]}`
                : "No events yet"}
            </p>
          </div>
          {summary?.lastEventAt && <span className="text-xs text-slate-400">Last {new Date(summary.lastEventAt).toLocaleTimeString()}</span>}
        </div>

        <div className="mt-4 grid gap-2">
          {events.length === 0 && <p className="text-sm text-slate-400">Run an AI coach request to populate this log.</p>}
          {events.slice(0, 8).map((event) => (
            <div key={event.id} className="grid gap-2 rounded-[8px] border border-white/10 bg-white/[0.04] p-3 text-xs md:grid-cols-[120px_1fr_90px]">
              <span className="text-slate-400">{new Date(event.at).toLocaleTimeString()}</span>
              <span>
                <span className="font-semibold text-slate-100">{event.provider}</span>
                <span className="text-slate-400"> {event.operation} {event.model} </span>
                <span className={eventTone[event.status]}>{event.status}</span>
                <span className="text-slate-500"> {event.reason}</span>
              </span>
              <span className="text-right text-slate-400">{event.durationMs}ms</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
