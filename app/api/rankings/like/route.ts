import { retiredApi } from "@/lib/retired-api";

export async function POST() {
  return retiredApi("公开互动功能已下线。");
}
