import type { AIProviderEvent } from "@/lib/ai-observability";
import { getRedisClient } from "@/lib/redis";

type CircuitProvider = "gateway" | "ollama";

type CircuitState = {
  provider: CircuitProvider;
  openedUntil: number;
  reason: string;
  failures: number;
  lastFailureAt: string | null;
  source?: "memory" | "redis";
};

const circuits: Record<CircuitProvider, CircuitState> = {
  gateway: { provider: "gateway", openedUntil: 0, reason: "", failures: 0, lastFailureAt: null },
  ollama: { provider: "ollama", openedUntil: 0, reason: "", failures: 0, lastFailureAt: null },
};

function cooldownMs(provider: CircuitProvider, status: AIProviderEvent["status"], httpStatus?: number) {
  if (status === "rate-limited" || httpStatus === 429) return provider === "gateway" ? 90_000 : 45_000;
  if (status === "timeout") return provider === "gateway" ? 25_000 : 35_000;
  if (status === "error") return provider === "gateway" ? 18_000 : 25_000;
  return 0;
}

function circuitKey(provider: CircuitProvider) {
  return `ai:circuit:${provider}`;
}

function snapshot(state: CircuitState) {
  const retryInMs = Math.max(0, state.openedUntil - Date.now());
  return {
    provider: state.provider,
    open: retryInMs > 0,
    retryInMs,
    reason: state.reason,
    failures: state.failures,
    lastFailureAt: state.lastFailureAt,
    source: state.source || "memory",
  };
}

async function readRedisCircuit(provider: CircuitProvider): Promise<CircuitState | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const raw = await redis.get(circuitKey(provider));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CircuitState>;
    if (parsed.provider !== provider || typeof parsed.openedUntil !== "number") return null;

    return {
      provider,
      openedUntil: parsed.openedUntil,
      reason: String(parsed.reason || ""),
      failures: Number(parsed.failures || 0),
      lastFailureAt: parsed.lastFailureAt || null,
      source: "redis",
    };
  } catch (error) {
    console.error("AI circuit Redis read error:", error instanceof Error ? error.message : error);
    return null;
  }
}

async function writeRedisCircuit(state: CircuitState, ttlMs: number) {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.psetex(circuitKey(state.provider), Math.max(1000, ttlMs), JSON.stringify({ ...state, source: "redis" }));
  } catch (error) {
    console.error("AI circuit Redis write error:", error instanceof Error ? error.message : error);
  }
}

async function deleteRedisCircuit(provider: CircuitProvider) {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(circuitKey(provider));
  } catch (error) {
    console.error("AI circuit Redis delete error:", error instanceof Error ? error.message : error);
  }
}

export async function getProviderCircuit(provider: CircuitProvider) {
  const memory = circuits[provider];
  const redis = await readRedisCircuit(provider);

  if (redis && redis.openedUntil > memory.openedUntil) {
    circuits[provider] = { ...redis, source: "redis" };
    return snapshot(circuits[provider]);
  }

  return snapshot(memory);
}

export async function shouldSkipProvider(provider: CircuitProvider) {
  return getProviderCircuit(provider);
}

export async function tripProviderCircuit(
  provider: CircuitProvider,
  status: AIProviderEvent["status"],
  reason: string,
  httpStatus?: number,
) {
  const ms = cooldownMs(provider, status, httpStatus);
  if (!ms) return;

  const state = circuits[provider];
  state.openedUntil = Date.now() + ms;
  state.reason = reason.slice(0, 120);
  state.failures += 1;
  state.lastFailureAt = new Date().toISOString();
  state.source = "memory";

  await writeRedisCircuit(state, ms + 2000);
}

export async function resetProviderCircuit(provider: CircuitProvider) {
  const state = circuits[provider];
  state.openedUntil = 0;
  state.reason = "";
  state.failures = 0;
  state.lastFailureAt = null;
  state.source = "memory";
  await deleteRedisCircuit(provider);
}
