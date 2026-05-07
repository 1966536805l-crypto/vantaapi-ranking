import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ message: "Report is not part of MVP" }, { status: 404 }); }
