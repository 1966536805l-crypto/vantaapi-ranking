import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { enforceRateLimitAsync, guardedJson, readJsonBody, sanitizeText, requireCsrf } from "@/lib/api-guard";
import { askSecurityAssistant } from "@/lib/security-ai";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  const csrfBlocked = requireCsrf(request);
  if (csrfBlocked) return csrfBlocked;

  const rateLimited = await enforceRateLimitAsync(request, 8, 5 * 60_000, "admin-security-assistant");
  if (rateLimited) return rateLimited;

  const parsedBody = await readJsonBody<Record<string, unknown>>(request, 12 * 1024);
  if (!parsedBody.ok) return parsedBody.response;

  const prompt = sanitizeText(String(parsedBody.body.prompt || ""), 5000);
  if (prompt.length < 4) {
    return guardedJson({ success: false, message: "请输入要检查的安全问题" }, { status: 400 });
  }

  const result = await askSecurityAssistant(prompt);
  return guardedJson({ success: true, ...result });
}
