import { retiredApi } from "@/lib/retired-api";

export async function POST() {
  return retiredApi("旧 AI review 接口已下线，请使用 AI Coach、代码解释或错题复盘入口。");
}
