import { NextRequest } from "next/server";

type TurnstileResult = {
  configured: boolean;
  success: boolean;
  reason?: string;
};

export async function verifyTurnstileToken(
  request: NextRequest,
  token: string | undefined,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY || "";
  const required = process.env.AUTH_TURNSTILE_REQUIRED === "true" || (process.env.NODE_ENV === "production" && process.env.AUTH_TURNSTILE_REQUIRED !== "false");

  if (!secret) {
    return {
      configured: false,
      success: !required,
      reason: required ? "turnstile-not-configured" : undefined,
    };
  }

  if (!token) {
    return { configured: true, success: false, reason: "missing-turnstile-token" };
  }

  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  if (ip) form.set("remoteip", ip);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(5000),
    });
    const data = (await response.json().catch(() => null)) as { success?: boolean; "error-codes"?: string[] } | null;

    if (!response.ok || !data?.success) {
      return {
        configured: true,
        success: false,
        reason: data?.["error-codes"]?.join(",") || `turnstile-http-${response.status}`,
      };
    }

    return { configured: true, success: true };
  } catch (error) {
    return {
      configured: true,
      success: false,
      reason: error instanceof Error ? error.message : "turnstile-verify-failed",
    };
  }
}
