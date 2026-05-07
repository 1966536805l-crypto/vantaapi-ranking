import { retiredApi } from "@/lib/retired-api";

export async function GET() {
  return retiredApi("旧公开展示功能已下线，本站已改为个人学习与项目控制台。");
}

export async function POST() {
  return retiredApi("公开项目提交功能已下线，请使用个人项目页记录自己的待办。");
}
