import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "旧 mistakes API 已下线，请访问 /wrong。" },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
