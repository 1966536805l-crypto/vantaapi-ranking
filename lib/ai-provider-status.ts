export type AIProviderStatus = {
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

function hostLabel(value: string) {
  if (!value) return "not configured";
  try {
    const url = new URL(value);
    return url.host;
  } catch {
    return "custom endpoint";
  }
}

function gatewayStatus(): AIProviderStatus {
  const configured = Boolean(process.env.AI_API_KEY);
  const baseUrl = process.env.AI_BASE_URL || "https://api.deepseek.com/v1";

  return {
    id: "gateway",
    label: "GLM / OpenAI compatible gateway",
    role: "primary",
    enabled: configured,
    configured,
    status: configured ? "ready" : "disabled",
    model: process.env.AI_MODEL || "deepseek-chat",
    endpoint: hostLabel(baseUrl),
    note: configured ? "Primary provider. Live token probe is skipped to avoid quota burn." : "Missing AI_API_KEY.",
  };
}

async function checkOllama(): Promise<AIProviderStatus> {
  const enabled = process.env.OLLAMA_ENABLED === "true";
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL || "qwen2.5:3b";
  const base: AIProviderStatus = {
    id: "ollama",
    label: "Ollama local model",
    role: "fallback",
    enabled,
    configured: enabled,
    status: enabled ? "offline" : "disabled",
    model,
    endpoint: hostLabel(baseUrl),
    note: enabled ? "Waiting for local Ollama health check." : "Disabled in this runtime.",
  };

  if (!enabled) return base;

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
      note: response.ok ? "Ollama is reachable from this Next.js runtime." : `Ollama returned HTTP ${response.status}.`,
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
  const providers = [gatewayStatus(), await checkOllama(), builtInStatus()];
  return {
    generatedAt: new Date().toISOString(),
    route: providers.map((provider) => provider.label).join(" -> "),
    providers,
  };
}
