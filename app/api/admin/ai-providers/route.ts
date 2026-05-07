import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { guardedJson, enforceRateLimitAsync } from "@/lib/api-guard";
import { getAIProviderStatuses } from "@/lib/ai-provider-status";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request, { allowUnverified2FA: true });
  if (response) return response;

  const rateLimited = await enforceRateLimitAsync(request, 30, 60_000, "admin-ai-providers");
  if (rateLimited) return rateLimited;

  const status = await getAIProviderStatuses();
  return guardedJson({ success: true, ...status });
}
