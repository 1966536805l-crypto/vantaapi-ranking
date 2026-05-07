import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ message: "Online C++ runner is not part of MVP" }, { status: 404 }); }
