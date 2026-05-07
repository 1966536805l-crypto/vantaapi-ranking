import { getAIEventSummary } from "@/lib/ai-observability";
import { getProviderCircuit } from "@/lib/ai-circuit-breaker";

export type AIProviderStatus = {
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

function hostLabel(value: string) {
  if (!value) return "not configured";
  try {
    const url = new URL(value);
    return url.host;
  } catch {
    return "custom endpoint";
  }
}

function isLocalEndpoint(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

async function gatewayStatus(): Promise<AIProviderStatus> {
  const configured = Boolean(process.env.AI_API_KEY);
  const baseUrl = process.env.AI_BASE_URL || "https://api.deepseek.com/v1";
  const circuit = await getProviderCircuit("gateway");

  return {
    id: "gateway",
    label: "GLM / OpenAI compatible gateway",
    role: "primary",
    enabled: configured,
    configured,
    status: configured ? (circuit.open ? "cooldown" : "ready") : "disabled",
    model: process.env.AI_MODEL || "deepseek-chat",
    endpoint: hostLabel(baseUrl),
    cooldownSeconds: circuit.open ? Math.ceil(circuit.retryInMs / 1000) : undefined,
    circuitSource: circuit.source,
    note: configured
      ? circuit.open
        ? `Cooling down after ${circuit.reason}.`
        : "Primary provider. Live token probe is skipped to avoid quota burn."
      : "Missing AI_API_KEY.",
  };
}

async function checkOllama(): Promise<AIProviderStatus> {
  const enabled = process.env.OLLAMA_ENABLED === "true";
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL || "qwen2.5:3b";
  const remoteWithoutToken = enabled && !isLocalEndpoint(baseUrl) && !process.env.OLLAMA_API_KEY;
  const circuit = await getProviderCircuit("ollama");
  const base: AIProviderStatus = {
    id: "ollama",
    label: "Ollama local model",
    role: "fallback",
    enabled,
    configured: enabled,
    status: enabled ? (circuit.open ? "cooldown" : "offline") : "disabled",
    model,
    endpoint: hostLabel(baseUrl),
    cooldownSeconds: circuit.open ? Math.ceil(circuit.retryInMs / 1000) : undefined,
    circuitSource: circuit.source,
    note: enabled
      ? circuit.open
        ? `Cooling down after ${circuit.reason}.`
        : remoteWithoutToken
        ? "Remote Ollama endpoint needs a secured auth proxy before production use."
        : "Waiting for local Ollama health check."
      : "Disabled in this runtime.",
  };

  if (!enabled || circuit.open) return base;

  const controller = new AbortController();
  const startedAt = Date.now();
  const timeoutId = setTimeout(() => controller.abort(), 1600);

  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/tags`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    return {
      ...base,
      status: response.ok ? "online" : "offline",
      latencyMs: Date.now() - startedAt,
      note: response.ok
        ? remoteWithoutToken
          ? "Reachable, but remote Ollama should be protected by an auth proxy."
          : "Ollama is reachable from this Next.js runtime."
        : `Ollama returned HTTP ${response.status}.`,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      ...base,
      latencyMs: Date.now() - startedAt,
      note: error instanceof Error ? error.message : "Ollama health check failed.",
    };
  }
}

function builtInStatus(): AIProviderStatus {
  return {
    id: "built-in",
    label: "Built in coach",
    role: "final",
    enabled: true,
    configured: true,
    status: "always-on",
    model: "built-in-coach",
    endpoint: "local code",
    note: "Fast deterministic fallback when external providers are unavailable.",
  };
}

export async function getAIProviderStatuses() {
  const providers = [await gatewayStatus(), await checkOllama(), builtInStatus()];
  return {
    generatedAt: new Date().toISOString(),
    route: providers.map((provider) => provider.label).join(" -> "),
    providers,
    eventSummary: getAIEventSummary(),
  };
}
