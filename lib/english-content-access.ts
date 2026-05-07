import { redirect } from "next/navigation";
import { localizedHref, type SiteLanguage } from "@/lib/language";

export function requireChineseForEnglishLearning(language: SiteLanguage) {
  if (language === "en") {
    redirect(localizedHref("/cpp", "en"));
  }
}
