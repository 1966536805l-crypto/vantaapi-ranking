import { retiredApi } from "@/lib/retired-api";

export async function PATCH() {
  return retiredApi("旧公开修改功能已下线。");
}

export async function DELETE() {
  return retiredApi("旧公开删除功能已下线。");
}
