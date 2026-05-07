import { retiredApi } from "@/lib/retired-api";

export async function GET() {
  return retiredApi("旧公开展示接口已下线。");
}
