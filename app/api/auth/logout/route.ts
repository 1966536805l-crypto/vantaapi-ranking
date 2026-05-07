import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { guardedJson, requireCsrf } from "@/lib/api-guard";

export async function POST(request: NextRequest) {
  const csrfBlocked = requireCsrf(request);
  if (csrfBlocked) return csrfBlocked;
  const response = guardedJson({ ok: true });
  clearAuthCookie(response);
  return response;
}

export async function GET() {
  return NextResponse.json(
    { message: "Method not allowed" },
    {
      status: 405,
      headers: {
        Allow: "POST",
        "Cache-Control": "no-store",
      },
    }
  );
}
