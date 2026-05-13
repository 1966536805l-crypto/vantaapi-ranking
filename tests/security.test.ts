import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { generateCsrfToken, signCsrfToken, validateCsrfRequest } from "@/lib/csrf";
import { rateLimit, stableHash } from "@/lib/proxy/rate-limit";

function request(method: string, headers: Record<string, string> = {}) {
  return new NextRequest("https://vantaapi.com/api/progress", {
    method,
    headers: {
      host: "vantaapi.com",
      ...headers,
    },
  });
}

describe("Security request guards", () => {
  it("allows safe methods without a CSRF token", () => {
    expect(validateCsrfRequest(request("GET"))).toBe(true);
  });

  it("accepts unsafe same-origin requests with a signed CSRF token", () => {
    const token = generateCsrfToken();
    const signature = signCsrfToken(token);

    const validRequest = request("POST", {
      origin: "https://vantaapi.com",
      "x-csrf-token": token,
      cookie: `csrf-token=${token}; csrf-signature=${signature}`,
    });

    expect(validateCsrfRequest(validRequest)).toBe(true);
  });

  it("rejects cross-site unsafe requests before token checks", () => {
    const token = generateCsrfToken();
    const signature = signCsrfToken(token);

    const blockedRequest = request("POST", {
      origin: "https://evil.example",
      "sec-fetch-site": "cross-site",
      "x-csrf-token": token,
      cookie: `csrf-token=${token}; csrf-signature=${signature}`,
    });

    expect(validateCsrfRequest(blockedRequest)).toBe(false);
  });

  it("enforces rate limit bucket capacity", () => {
    const key = `test:${stableHash(`${Date.now()}:${Math.random()}`)}`;

    expect(rateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 2, 60_000).allowed).toBe(false);
  });
});
