import { retiredApi } from "@/lib/retired-api";

export async function POST() {
  return retiredApi("This standalone mistake-analysis endpoint is retired. Use AI Coach or the wrong-question review flow instead.");
}
