import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "旧公开展示接口已下线。" },
    { status: 410 }
  );
}
