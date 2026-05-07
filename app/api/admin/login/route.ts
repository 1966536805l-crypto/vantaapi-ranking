import { NextRequest } from "next/server";
import { POST as login } from "@/app/api/auth/login/route";
export async function POST(request: NextRequest) { return login(request); }
