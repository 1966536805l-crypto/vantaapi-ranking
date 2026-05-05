import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "公开分类功能已下线，本站已改为个人控制台。" },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "公开分类创建功能已下线。" },
    { status: 410 }
  );
}
