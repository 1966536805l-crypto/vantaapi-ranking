import { retiredApi } from "@/lib/retired-api";

export async function GET() {
  return retiredApi("This mistakes endpoint is retired. Use the wrong-question review flow instead.");
}
