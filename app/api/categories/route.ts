import { retiredApi } from "@/lib/retired-api";

export async function GET() {
  return retiredApi("公开分类功能已下线，本站已改为个人控制台。");
}

export async function POST() {
  return retiredApi("公开分类创建功能已下线。");
}
