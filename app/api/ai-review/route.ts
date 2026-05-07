import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json(
    { message: "旧 AI review 接口已下线，请使用 AI Coach、代码解释或错题复盘入口。" },
    { status: 410, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" } },
  );
}
