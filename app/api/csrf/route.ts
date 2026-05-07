import { createCsrfResponse } from "@/lib/csrf";

export const dynamic = "force-dynamic";

export async function GET() {
  return createCsrfResponse();
}
