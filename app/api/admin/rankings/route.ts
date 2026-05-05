import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "旧公开审核后台已下线。" },
    { status: 410 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { message: "旧公开审核后台已下线。" },
    { status: 410 }
  );
}
