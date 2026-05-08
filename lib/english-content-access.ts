import { redirect } from "next/navigation";
import { localizedHref, type InterfaceLanguage, type SiteLanguage } from "@/lib/language";

export function requireChineseForEnglishLearning(language: InterfaceLanguage | SiteLanguage) {
  if (language !== "zh") {
    redirect(localizedHref("/programming", language));
  }
}
