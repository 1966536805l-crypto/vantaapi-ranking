import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "公开互动功能已下线。" },
    { status: 410 }
  );
}
