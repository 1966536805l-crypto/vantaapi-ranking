import { retiredApi } from "@/lib/retired-api";

export async function POST() {
  return retiredApi("The legacy AI teacher endpoint is retired. Use the focused AI Coach or developer tools instead.");
}
