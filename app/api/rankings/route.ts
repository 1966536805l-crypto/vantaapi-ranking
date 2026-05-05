import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "旧公开展示功能已下线，本站已改为个人学习与项目控制台。" },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "公开项目提交功能已下线，请使用个人项目页记录自己的待办。" },
    { status: 410 }
  );
}
