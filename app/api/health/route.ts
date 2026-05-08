import { guardedJson } from "@/lib/api-guard";
import { getPublicHealthSnapshot } from "@/lib/public-health";

export const dynamic = "force-dynamic";

export async function GET() {
  return guardedJson(getPublicHealthSnapshot());
}
