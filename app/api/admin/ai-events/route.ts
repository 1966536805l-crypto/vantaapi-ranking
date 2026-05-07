import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { guardedJson, enforceRateLimitAsync } from "@/lib/api-guard";
import { listAIEvents } from "@/lib/ai-observability";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request, { allowUnverified2FA: true });
  if (response) return response;

  const rateLimited = await enforceRateLimitAsync(request, 30, 60_000, "admin-ai-events");
  if (rateLimited) return rateLimited;

  return guardedJson({
    success: true,
    events: listAIEvents(30),
  });
}
