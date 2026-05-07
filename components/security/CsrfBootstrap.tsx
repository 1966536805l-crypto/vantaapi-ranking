"use client";

import { useEffect } from "react";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function readCookie(name: string) {
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) || "";
}

async function ensureCsrfToken() {
  const current = readCookie("csrf-token");
  if (current) return decodeURIComponent(current);

  const response = await window.fetch("/api/csrf", { cache: "no-store", credentials: "same-origin" });
  const data = (await response.json().catch(() => ({}))) as { csrfToken?: string };
  return data.csrfToken || decodeURIComponent(readCookie("csrf-token"));
}

function isSameOrigin(input: RequestInfo | URL) {
  const url = typeof input === "string" || input instanceof URL ? String(input) : input.url;
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return true;
  }
}

export default function CsrfBootstrap() {
  useEffect(() => {
    void ensureCsrfToken().catch(() => null);

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
      if (!UNSAFE_METHODS.has(method) || !isSameOrigin(input)) {
        return originalFetch(input, init);
      }

      const token = await ensureCsrfToken();
      const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
      if (token && !headers.has("x-csrf-token")) headers.set("x-csrf-token", token);

      return originalFetch(input, { ...init, headers, credentials: init?.credentials || "same-origin" });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
