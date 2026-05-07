import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "旧独立错题分析接口已下线，请在 AI Coach 或错题本内使用复盘能力。" },
    {
      status: 410,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  );
}
