import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json(
    { message: "C++ 在线运行已下线，公开版本只保留代码阅读、填空和选择训练。" },
    { status: 410, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" } },
  );
}
