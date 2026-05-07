import { NextResponse } from "next/server";

const retiredHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export function retiredApi(message: string) {
  return NextResponse.json(
    { message },
    { status: 410, headers: retiredHeaders },
  );
}
