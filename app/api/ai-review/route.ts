import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ message: "AI review is not part of MVP" }, { status: 404 }); }
