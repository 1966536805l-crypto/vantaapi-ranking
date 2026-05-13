import { retiredApi } from "@/lib/retired-api";

export async function POST() {
  return retiredApi("旧举报接口已下线，当前公开版本不开放 report 功能。");
}
