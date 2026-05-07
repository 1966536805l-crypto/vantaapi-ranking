import { NextRequest } from "next/server";
import crypto from "crypto";

export type AuditOutcome = "success" | "failure" | "blocked";

function hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export function getAuditIpHash(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";
  return hash(ip);
}

export function auditEvent(
  request: NextRequest,
  event: string,
  outcome: AuditOutcome,
  details: Record<string, unknown> = {},
) {
  const payload = {
    ts: new Date().toISOString(),
    event,
    outcome,
    ipHash: getAuditIpHash(request),
    userAgentHash: hash(request.headers.get("user-agent") || "unknown"),
    ...details,
  };

  // Console logging is intentional: Vercel/PM2 can ship stdout to centralized log storage.
  console.info(JSON.stringify({ audit: payload }));
}

export function hashAuditSubject(value: string) {
  return hash(value.trim().toLowerCase());
}
