export type AIProviderEvent = {
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

const MAX_EVENTS = 80;
const events: AIProviderEvent[] = [];
let eventCounter = 0;

export function classifyAIReason(error?: string, status?: number): AIProviderEvent["status"] {
  if (status === 429) return "rate-limited";
  if (status && status >= 400) return "error";
  const normalized = (error || "").toLowerCase();
  if (normalized.includes("timeout") || normalized.includes("超时") || normalized.includes("abort")) return "timeout";
  if (normalized.includes("disabled") || normalized.includes("未启用") || normalized.includes("未配置")) return "disabled";
  return "error";
}

export function recordAIEvent(event: Omit<AIProviderEvent, "id" | "at">) {
  eventCounter += 1;
  events.push({
    ...event,
    id: `${Date.now().toString(36)}-${eventCounter.toString(36)}`,
    at: new Date().toISOString(),
    reason: event.reason.slice(0, 160),
  });

  while (events.length > MAX_EVENTS) events.shift();
}

export function listAIEvents(limit = 30) {
  return events.slice(-limit).reverse();
}

export function getAIEventSummary() {
  const recent = events.slice(-40);
  const counts = recent.reduce(
    (acc, event) => {
      acc.total += 1;
      acc[event.status] += 1;
      return acc;
    },
    { total: 0, success: 0, error: 0, timeout: 0, "rate-limited": 0, disabled: 0 },
  );

  const lastEvent = recent.at(-1);
  return {
    ...counts,
    lastEventAt: lastEvent?.at || null,
  };
}
