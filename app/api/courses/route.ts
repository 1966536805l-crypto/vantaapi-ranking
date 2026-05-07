import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toLearningDirection } from "@/lib/learning";

export async function GET(request: NextRequest) {
  const directionParam = new URL(request.url).searchParams.get("direction") || "";
  const direction = toLearningDirection(directionParam);
  const courses = await prisma.course.findMany({ where: { ...(direction ? { direction } : {}), isPublished: true }, orderBy: { sortOrder: "asc" }, include: { lessons: { where: { isPublished: true }, orderBy: { sortOrder: "asc" } } } });
  return NextResponse.json({ courses });
}
