import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "公开评论功能已下线。" },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "公开评论功能已下线。" },
    { status: 410 }
  );
}
