import { retiredApi } from "@/lib/retired-api";

export async function GET() {
  return retiredApi("公开评论功能已下线。");
}

export async function POST() {
  return retiredApi("公开评论功能已下线。");
}
