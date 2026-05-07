import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json(
    { message: "旧举报接口已下线，当前公开版本不开放 report 功能。" },
    { status: 410, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" } },
  );
}
