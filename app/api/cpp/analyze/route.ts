import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ message: "C++ analysis is not part of MVP" }, { status: 404 }); }
