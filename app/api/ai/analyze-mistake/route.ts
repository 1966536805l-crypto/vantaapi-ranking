import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "AI mistake analysis is not part of the learning-site MVP." },
    {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  );
}
